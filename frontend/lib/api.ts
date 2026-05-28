const fallbackApiBaseUrl = "https://machinery-api.onrender.com";
const tokenStorageKeys = {
  accessToken: "gnoudcrm.accessToken",
  refreshToken: "gnoudcrm.refreshToken",
  user: "gnoudcrm.user",
};

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  fallbackApiBaseUrl;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type UserRole = "ADMIN" | "TECHNICIAN" | "DISPATCHER";
export type UserStatus = "ACTIVE" | "DISABLED";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type AuthResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};

export type DashboardStats = {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
  availabilityRate: number;
  rentedRate: number;
  maintenanceRate: number;
};

export type DashboardCostPoint = {
  month: number;
  year: number;
  label: string;
  totalCost: number;
};

export type DashboardMaintenanceRow = {
  id: string;
  equipment: string;
  technician: string;
  date: string;
  level: string;
  status: string;
  cost: number;
};

export type DashboardActivity = {
  title: string;
  body: string;
  time: string;
  tone: "sky" | "green" | "slate" | "amber";
};

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${apiBaseUrl}${normalizedPath}`;
}

export function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(tokenStorageKeys.accessToken);
}

export function getRefreshToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(tokenStorageKeys.refreshToken);
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(tokenStorageKeys.user);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    return null;
  }
}

export function storeAuthSession(auth: AuthResponse) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    tokenStorageKeys.accessToken,
    auth.tokens.accessToken,
  );
  window.localStorage.setItem(
    tokenStorageKeys.refreshToken,
    auth.tokens.refreshToken,
  );
  window.localStorage.setItem(tokenStorageKeys.user, JSON.stringify(auth.user));
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(tokenStorageKeys.accessToken);
  window.localStorage.removeItem(tokenStorageKeys.refreshToken);
  window.localStorage.removeItem(tokenStorageKeys.user);
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { auth?: boolean },
): Promise<T> {
  const { auth, ...requestInit } = init ?? {};
  const headers = new Headers(requestInit.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const accessToken = getAccessToken();

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(apiUrl(path), {
    ...requestInit,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status);
  }

  return response.json() as Promise<T>;
}

async function getErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string | string[] };
    const message = data.message;

    if (Array.isArray(message)) {
      return message.join(" ");
    }

    return message ?? `API request failed: ${response.status}`;
  } catch {
    return `API request failed: ${response.status}`;
  }
}

export const authApi = {
  register(input: { fullName: string; email: string; password: string }) {
    return apiFetch<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  login(input: { email: string; password: string }) {
    return apiFetch<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  refresh(refreshToken: string) {
    return apiFetch<{ accessToken: string; expiresIn: number }>(
      "/api/v1/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      },
    );
  },
  logout() {
    return apiFetch<{ message: string }>("/api/v1/auth/logout", {
      method: "POST",
      auth: true,
    });
  },
  me() {
    return apiFetch<{ user: AuthUser }>("/api/v1/auth/me", {
      auth: true,
    });
  },
  forgotPassword(email: string) {
    return apiFetch<{ message: string; resetUrl: string }>(
      "/api/v1/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
    );
  },
  resetPassword(input: { token: string; password: string }) {
    return apiFetch<{ message: string }>("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};

export const dashboardApi = {
  getStats() {
    return apiFetch<DashboardStats>("/api/v1/dashboard/stats", {
      auth: true,
    });
  },
  getCostHistory() {
    return apiFetch<DashboardCostPoint[]>("/api/v1/dashboard/cost-history", {
      auth: true,
    });
  },
  getRecentMaintenance() {
    return apiFetch<DashboardMaintenanceRow[]>(
      "/api/v1/dashboard/recent-maintenance",
      {
        auth: true,
      },
    );
  },
  getRecentActivities() {
    return apiFetch<DashboardActivity[]>(
      "/api/v1/dashboard/recent-activities",
      {
        auth: true,
      },
    );
  },
};

// --- Machinery Types ---

export type MachineryStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';

export type CategoryItem = {
  _id: string;
  name: string;
  description?: string;
};

export type MachineryItem = {
  _id: string;
  name: string;
  serialNumber: string;
  manufacturer?: string;
  operatingHours: number;
  fuelConsumption: number;
  purchaseYear?: number;
  status: MachineryStatus;
  category?: CategoryItem | null;
  specs: Record<string, unknown>;
  location?: string;
  createdAt: string;
  updatedAt: string;
};

export type MachineryListResponse = {
  data: MachineryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type MachineryQueryParams = {
  page?: number;
  limit?: number;
  status?: MachineryStatus;
  category?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
};

export const machineryApi = {
  getAll(params?: MachineryQueryParams) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.set(key, String(value));
        }
      });
    }
    const qs = query.toString();
    return apiFetch<MachineryListResponse>(
      `/api/v1/machineries${qs ? `?${qs}` : ''}`,
      { auth: true },
    );
  },
  getById(id: string) {
    return apiFetch<MachineryItem>(`/api/v1/machineries/${id}`, {
      auth: true,
    });
  },
  create(data: Record<string, unknown>) {
    return apiFetch<MachineryItem>('/api/v1/machineries', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: true,
    });
  },
  update(id: string, data: Record<string, unknown>) {
    return apiFetch<MachineryItem>(`/api/v1/machineries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      auth: true,
    });
  },
  remove(id: string) {
    return apiFetch<{ message: string }>(`/api/v1/machineries/${id}`, {
      method: 'DELETE',
      auth: true,
    });
  },
};

export const categoryApi = {
  getAll() {
    return apiFetch<CategoryItem[]>('/api/v1/categories', {
      auth: true,
    });
  },
};
