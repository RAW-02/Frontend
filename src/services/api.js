import axios from "axios";

// baseURL is prepended to every request URL automatically.
// searchService calling api.get("/api/search") becomes:
// GET http://localhost:8000/api/search
const api = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── REQUEST INTERCEPTOR ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.params ?? "");
    return config;
  },

  (error) => {
    console.error("[API] Request setup error:", error);
    return Promise.reject(error);
  }
);

// ── RESPONSE INTERCEPTOR ─────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.status} ${response.config.url}`);
    return response;
  },

  (error) => {
    if (error.response) {
      const status = error.response.status;
      const url    = error.config?.url;

      if (status === 404) {
        console.warn(`[API] 404 Not found: ${url}`);
        error.userMessage = "Resource not found.";

      } else if (status === 422) {
        console.warn(`[API] 422 Validation error: ${url}`);
        error.userMessage = "Invalid request. Please check your input.";

      } else if (status >= 500) {
        console.error(`[API] ${status} Server error: ${url}`);
        error.userMessage = "Server error. Please try again later.";

      } else {
        console.error(`[API] ${status} Error: ${url}`);
        error.userMessage = `Request failed with status ${status}.`;
      }

    } else if (error.code === "ECONNABORTED") {
      console.error("[API] Request timed out");
      error.userMessage = "Request timed out. Is the backend running?";

    } else {
      console.error("[API] Network error:", error.message);
      error.userMessage = "Cannot reach the server. Is the backend running?";
    }

    return Promise.reject(error);
  }
);

export default api;