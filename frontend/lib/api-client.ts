const TOKEN_KEY = "bank_sampah_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export interface ApiErrorResponse {
  message?: string;
  errors?: Array<{ path?: string[]; message: string }>;
}

export class ApiError extends Error {
  status: number;
  data?: ApiErrorResponse;

  constructor(status: number, message: string, data?: ApiErrorResponse) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers = {}, ...rest } = options;

  let url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes("?") ? "&" : "?") + qs;
    }
  }

  const token = getStoredToken();
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
    credentials: "include", // for cookie authentication
  });

  if (!response.ok) {
    let errorData: ApiErrorResponse | undefined;
    let errorMessage = `Permintaan gagal (${response.status})`;

    try {
      errorData = await response.json();
      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.errors && errorData.errors.length > 0) {
        errorMessage = errorData.errors.map((e) => e.message).join(", ");
      }
    } catch {
      // response is not json
    }

    if (response.status === 401 && typeof window !== "undefined") {
      // Session expired, remove local token if on a non-auth page
      if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
        setStoredToken(null);
      }
    }

    throw new ApiError(response.status, errorMessage, errorData);
  }

  // Check if response is empty
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return {} as T;
}
