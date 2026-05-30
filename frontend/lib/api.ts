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

  if (!(requestInit.body instanceof FormData) && !headers.has("Content-Type")) {
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
  imageUrl?: string;
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
  getMaintenance(id: string) {
    return apiFetch<MaintenanceItem[]>(`/api/v1/machineries/${id}/maintenance`, {
      auth: true,
    });
  },
  getAssignments(id: string) {
    return apiFetch<any[]>(`/api/v1/machineries/${id}/assignments`, {
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

export function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<{ url: string }>("/api/v1/upload", {
    method: "POST",
    body: formData,
    auth: true,
  });
}

// --- Assignment Types ---

export type AssignmentItem = {
  _id: string;
  machinery: MachineryItem | null;
  dispatcher: { _id: string; fullName: string; email: string } | null;
  destination: string;
  startDate: string;
  endDate?: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type AssignmentListResponse = {
  data: AssignmentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AssignmentStats = {
  total: number;
  pending: number;
  active: number;
  completed: number;
};

export type AssignmentQueryParams = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  order?: 'asc' | 'desc';
};

export const assignmentApi = {
  getAll(params?: AssignmentQueryParams) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.set(key, String(value));
        }
      });
    }
    const qs = query.toString();
    return apiFetch<AssignmentListResponse>(
      `/api/v1/assignments${qs ? `?${qs}` : ''}`,
      { auth: true },
    );
  },
  getStats() {
    return apiFetch<AssignmentStats>('/api/v1/assignments/stats', {
      auth: true,
    });
  },
  getById(id: string) {
    return apiFetch<AssignmentItem>(`/api/v1/assignments/${id}`, {
      auth: true,
    });
  },
  create(data: Record<string, unknown>) {
    return apiFetch<AssignmentItem>('/api/v1/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: true,
    });
  },
  update(id: string, data: Record<string, unknown>) {
    return apiFetch<AssignmentItem>(`/api/v1/assignments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      auth: true,
    });
  },
  remove(id: string) {
    return apiFetch<{ message: string }>(`/api/v1/assignments/${id}`, {
      method: 'DELETE',
      auth: true,
    });
  },
};

// --- Maintenance Types ---

export type MaintenanceType =
  | "ROUTINE"
  | "EMERGENCY"
  | "INSPECTION"
  | "REPLACEMENT";

export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type MaintenanceStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type SparePartItem = {
  name: string;
  quantity: number;
  cost: number;
};

export type MaintenanceTechnician = {
  _id: string;
  fullName: string;
  email: string;
  role?: UserRole;
};

export type MaintenanceItem = {
  _id: string;
  machinery: MachineryItem | null;
  technician: MaintenanceTechnician | null;
  cost: number;
  type: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  description: string;
  completedAt?: string;
  spareParts: SparePartItem[];
  createdAt: string;
  updatedAt: string;
};

export type MaintenanceListResponse = {
  data: MaintenanceItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type MaintenanceStats = {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  monthlyCost: number;
};

export type MaintenanceQueryParams = {
  page?: number;
  limit?: number;
  status?: MaintenanceStatus;
  type?: MaintenanceType;
  priority?: MaintenancePriority;
  machinery?: string;
  technician?: string;
  search?: string;
  minCost?: number;
  maxCost?: number;
  sort?: string;
  order?: "asc" | "desc";
};

export type CreateMaintenanceInput = {
  machinery: string;
  technician?: string;
  cost?: number;
  type?: MaintenanceType;
  priority?: MaintenancePriority;
  status?: MaintenanceStatus;
  description: string;
  completedAt?: string;
  spareParts?: SparePartItem[];
};

export const maintenanceApi = {
  getAll(params?: MaintenanceQueryParams) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.set(key, String(value));
        }
      });
    }
    const qs = query.toString();
    return apiFetch<MaintenanceListResponse>(
      `/api/v1/maintenance${qs ? `?${qs}` : ""}`,
      { auth: true },
    );
  },
  getStats() {
    return apiFetch<MaintenanceStats>("/api/v1/maintenance/stats", {
      auth: true,
    });
  },
  getById(id: string) {
    return apiFetch<MaintenanceItem>(`/api/v1/maintenance/${id}`, {
      auth: true,
    });
  },
  create(data: CreateMaintenanceInput) {
    return apiFetch<MaintenanceItem>("/api/v1/maintenance", {
      method: "POST",
      body: JSON.stringify(data),
      auth: true,
    });
  },
  update(id: string, data: Partial<CreateMaintenanceInput>) {
    return apiFetch<MaintenanceItem>(`/api/v1/maintenance/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      auth: true,
    });
  },
  remove(id: string) {
    return apiFetch<{ message: string }>(`/api/v1/maintenance/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};

// --- Users Management Types ---

export type UserItem = {
  _id: string;
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type UserListResponse = {
  data: UserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type UserQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
};

export type UserStatsResponse = {
  total: number;
  admin: number;
  dispatcher: number;
  technician: number;
};

export const usersApi = {
  getAll(params?: UserQueryParams) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.set(key, String(value));
        }
      });
    }
    const qs = query.toString();
    return apiFetch<UserListResponse>(`/api/v1/users${qs ? `?${qs}` : ""}`, {
      auth: true,
    });
  },
  getStats() {
    return apiFetch<UserStatsResponse>("/api/v1/users/stats", {
      auth: true,
    });
  },
  getById(id: string) {
    return apiFetch<UserItem>(`/api/v1/users/${id}`, {
      auth: true,
    });
  },
  create(data: Record<string, unknown>) {
    return apiFetch<UserItem>("/api/v1/users", {
      method: "POST",
      body: JSON.stringify(data),
      auth: true,
    });
  },
  update(id: string, data: Record<string, unknown>) {
    return apiFetch<UserItem>(`/api/v1/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      auth: true,
    });
  },
  remove(id: string) {
    return apiFetch<{ message: string }>(`/api/v1/users/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};

