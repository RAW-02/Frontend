import axios from "axios";

// ── Base URL logic ─────────────────────────────────────────────
//
// Development (npm run dev):
//   VITE_API_URL is not set → BASE_URL = ""
//   All requests go to localhost:5173 → vite proxy forwards to backend
//   Backend IP stays in .env.local (gitignored)
//
// Production (deployed on EC2):
//   VITE_API_URL is set by GitHub Actions Variable at build time
//   Built into the JS bundle → points directly to backend EC2
//   Backend IP is in GitHub Actions Variables (not secrets, not code)

const BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Log only in development — never log in production
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Never log full error objects in production
    if (import.meta.env.DEV) {
      console.error("[API Error]", error.response?.status, error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default api;
