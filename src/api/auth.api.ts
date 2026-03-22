import api from "./api.index"; 
import type { 
  AuthResponse, 
  RegisterPayload, 
  LoginPayload, 
  VerifyOtpPayload 
} from "../types/api.types";

export const AuthAPI = {
  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/verify-otp", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    const response = await api.post("/auth/logout");
    return response.data;
  }
};