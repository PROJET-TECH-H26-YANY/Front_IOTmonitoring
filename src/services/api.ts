import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthResponse } from "../types";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const request = async <T>(
  endpoint: string,
  options: RequestInit,
): Promise<T> => {
  const token = await AsyncStorage.getItem("token");

  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  if (!isFormData) {
    (headers as any)["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erreur ${response.status}`);
  }

  if (response.status === 204) return null as unknown as T;
  return response.json();
};

export const authService = {
  login: (data: any) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: any) =>
    request<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const studentService = {
  getAll: () =>
    request<import("../types").Student[]>("/api/admin/students", {
      method: "GET",
    }),

  create: (data: { nom: string; nfcUid: string | null }) =>
    request<any>("/api/admin/student", {
      method: "POST",
      body: JSON.stringify(data), 
    }),

  update: (id: number, data: { nom?: string; nfcUid?: string | null }) =>
    request<any>(`/api/admin/student/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<any>(`/api/admin/student/${id}`, {
      method: "DELETE",
    }),
};

export const dashboardService = {
  getLive: () =>
    request<import("../types").SessionData[]>("/api/admin/live", {
      method: "GET",
    }),

  getHistory: () =>
    request<import("../types").SessionData[]>("/api/admin/history", {
      method: "GET",
    }),

  forceClose: (id: number) =>
    request<any>(`/api/admin/session/${id}`, {
      method: "DELETE",
    }),

  getMe: () =>
    request<any>("/api/admin/me", {
      method: "GET",
    }),
};
