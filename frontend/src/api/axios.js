import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error normalisation
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const detail = error.response.data?.detail;
      const message =
        typeof detail === "string"
          ? detail
          : error.response.data?.message || "An error occurred";
      const enhancedError = new Error(message);
      enhancedError.status = error.response.status;
      enhancedError.data = error.response.data;
      return Promise.reject(enhancedError);
    } else if (error.request) {
      return Promise.reject(
        new Error("Network error: Could not reach the server. Please check your connection.")
      );
    }
    return Promise.reject(error);
  }
);

export default api;
