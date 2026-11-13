"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiClient, setStoredToken, getStoredToken } from "@/lib/api-client";
import { Role } from "@bank-sampah/shared";
import { useRouter } from "next/navigation";

export interface UserProfile {
  id: string;
  nama: string;
  email: string;
  role: Role;
  saldo: number;
  noHp?: string;
  alamat?: string;
  aktif: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (data: { nama: string; email: string; password: string; noHp?: string; alamat?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await apiClient<{ user: UserProfile }>("/api/auth/me");
      if (res?.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      setStoredToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      fetchCurrentUser();
    } else {
      // Still try in case httpOnly cookie is present
      fetchCurrentUser();
    }
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await apiClient<{ message: string; token: string; user: UserProfile }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.token) {
        setStoredToken(res.token);
      }
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    nama: string;
    email: string;
    password: string;
    noHp?: string;
    alamat?: string;
  }): Promise<void> => {
    setIsLoading(true);
    try {
      await apiClient("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      setStoredToken(null);
      setUser(null);
      router.push("/login");
    }
  };

  const refreshUser = async (): Promise<void> => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
