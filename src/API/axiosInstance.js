import axios from "axios";
import { toast } from "sonner";

const BASE_URL = "http://192.168.100.149:3000/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => response.data,

  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      toast.error("Network error. Please check your internet.");
      return Promise.reject(error);
    }

    const status = error.response.status;

    const isAuthRoute =
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/register") ||
      originalRequest.url.includes("/auth/refresh") ||
      originalRequest.url.includes("/auth/forgot-password") ||
      originalRequest.url.includes("/auth/reset-password") ||
      originalRequest.url.includes("/auth/verify-email");

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          localStorage.clear();
          toast.error("Session expired. Please login again.");
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken = response.data?.data?.accessToken;
        const newRefreshToken = response.data?.data?.refreshToken;

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        localStorage.clear();
        toast.error("Session expired. Please login again.");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    
    switch (status) {
      case 400:
        toast.error(error.response.data?.message || "Bad request");
        break;
      case 401:
        toast.error(error.response.data?.message || "Unauthorized");
        break;
      case 403:
        toast.error(error.response.data?.message || "Access denied");
        break;
      case 404:
        toast.error(error.response.data?.message || "Resource not found");
        break;
      case 409: 
        toast.error(error.response.data?.message || "Conflict error");
        break;
      case 422:
        toast.error(error.response.data?.message || "Validation error");
        break;
      default:
        if (status >= 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(error.response.data?.message || "Something went wrong");
        }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;