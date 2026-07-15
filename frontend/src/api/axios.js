import axios from "axios";

const api = axios.create({
  // baseURL: "http://127.0.0.1:8000/api",
  baseURL: "https://cornea-apply-vendor.ngrok-free.dev/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("activeWorkspaceId");
      localStorage.removeItem("activeWorkspaceName");
    }

    return Promise.reject(error);
  }
);

export default api;