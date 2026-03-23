import api from "./api.index";
import type { User } from "../types/api.types";

export interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface UpdateProfilePayload {
  personal_info?: {
    fullname?: string;
    bio?: string;
    headline?: string;
  };
  social_links?: {
    twitter?: string;
    github?: string;
    website?: string;
    linkedin?: string;
    youtube?: string;
    instagram?: string;
    facebook?: string;
  };
}

export interface UsernameCheckResponse {
  available: boolean;
  suggestions?: string[];
}

export const UsersAPI = {
  checkUsername: async (username: string): Promise<UsernameCheckResponse> => {
    const response = await api.get<BackendResponse<UsernameCheckResponse>>(
      `/users/check-username`, 
      { params: { username } }
    );
    return response.data.data;
  },
  
  getMe: async (): Promise<User> => {
    const response = await api.get<BackendResponse<User>>(`/users/me`);
    return response.data.data; 
  },

  getProfileByUsername: async (username: string): Promise<User> => {
    const response = await api.get<BackendResponse<User>>(`/users/profile/${username}`);
    return response.data.data;
  },

  updateProfile: async (userId: string, payload: UpdateProfilePayload): Promise<User> => {
    const response = await api.put<BackendResponse<User>>(`/users/${userId}`, payload);
    return response.data.data;
  },

  deleteProfile: async (userId: string): Promise<void> => {
    await api.delete<BackendResponse<null>>(`/users/${userId}`);
  }
};