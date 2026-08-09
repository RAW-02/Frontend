



import axios from "axios";

const api = axios.create({
  baseURL: "",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(
        `[API] ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      console.error(
        "[API Error]",
        error.response?.status,
        error.config?.url
      );
    }

    return Promise.reject(error);
  }
);

export default api;
