import api from "./api.index"; 
import type { 
  AuthResponse, 
  RegisterPayload, 
  LoginPayload, 
  VerifyOtpPayload 
} from "../types/api.types";

// Defines the exact structure of your backend's ApiResponse class
interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export const AuthAPI = {
  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const response = await api.post<BackendResponse<AuthResponse>>("/auth/register", data);
    return response.data.data;
  },

  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<BackendResponse<AuthResponse>>("/auth/login", data);
    return response.data.data;
  },

  verifyOtp: async (data: VerifyOtpPayload): Promise<AuthResponse> => {
    const response = await api.post<BackendResponse<AuthResponse>>("/auth/verify-otp", data);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post<BackendResponse<null>>("/auth/logout");
  }
};