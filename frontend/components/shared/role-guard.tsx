"use client";

import { useAuth } from "@/context/auth-context";
import { Role } from "@bank-sampah/shared";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard
        if (user.role === "NASABAH") router.push("/nasabah/dashboard");
        else if (user.role === "PETUGAS") router.push("/petugas/dashboard");
        else if (user.role === "ADMIN") router.push("/admin/dashboard");
      }
    }
  }, [user, isLoading, allowedRoles, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col p-8 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
