import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { storage } from "../lib/storage";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor ──────────────────────────────────────────────────────
// Automatically attaches the access token to every request
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = storage.get<string>(storage.KEYS.ACCESS_TOKEN);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────
// Centralized error handling; extend here for token refresh logic later
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired — clear storage and redirect to login
      storage.remove(storage.KEYS.ACCESS_TOKEN);
      storage.remove(storage.KEYS.REFRESH_TOKEN);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);