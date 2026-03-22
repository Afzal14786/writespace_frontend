import axios, { AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import type { ApiError } from "../types/ApiError";

// 1. Extend the default Axios config to include our custom _retry flag
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 2. Define the expected response structure from your refresh token endpoint
interface RefreshTokenResponse {
  accessToken: string;
}

// 3. Type the queue items strictly
interface FailedQueueItem {
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api/v1",
});

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: Error | AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      // If there's no error, we safely assume the token is a string
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    // Explicitly check if headers exist to satisfy strict TypeScript checks
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    // Cast config to our custom interface instead of 'any'
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    // Safety check in case the config somehow doesn't exist
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call your refresh token endpoint with proper return typing
        const response = await axios.post<RefreshTokenResponse>(
          `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api/v1"}/auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken } = response.data;

        // Store new access token
        localStorage.setItem("accessToken", accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);

        // Retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        const typedError = refreshError instanceof Error ? refreshError : new Error(String(refreshError));
        
        processQueue(typedError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
        
        return Promise.reject(refreshError);
        
      } finally {
        isRefreshing = false;
      }
    }

    // Format the API error cleanly
    const apiError: ApiError = {
      status: error.response?.status,
      message:
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred",
      errors: error.response?.data?.errors,
    };
    
    return Promise.reject(apiError);
  }
);

export default api;