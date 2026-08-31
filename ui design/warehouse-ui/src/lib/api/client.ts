import type { ApiResponse } from "./types";
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("access_token") : null;
  const response = await fetch(`/api/backend${path}`, { ...init, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers } });
  if (response.status === 204) return undefined as T;
  const body = await response.json() as ApiResponse<T>;
  if (response.status === 401 && typeof window !== "undefined" && path !== "/auth/login") {
    window.localStorage.removeItem("access_token");
    window.localStorage.removeItem("auth_user");
    window.dispatchEvent(new Event("auth-expired"));
  }
  if (!response.ok || !body.success) throw new Error(!body.success ? body.error.message ?? body.error.code : `HTTP ${response.status}`);
  return body.data;
}

export async function apiDownload(path: string): Promise<Blob> {
  const token = window.localStorage.getItem("access_token");
  const response = await fetch(`/api/backend${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error(`Không tải được tệp (HTTP ${response.status})`);
  return response.blob();
}
