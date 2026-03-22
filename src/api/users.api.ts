import api from "./api.index";
import type { User } from "../types/api.types";

interface BackendResponse<T> {
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

export const UsersAPI = {
  getMe: async (): Promise<User> => {
    const userDataStr = localStorage.getItem("userData");
    if (!userDataStr) {
      throw new Error("User not authenticated");
    }
    
    // Parse stored data to get the username, then fetch fresh data
    const sessionData = JSON.parse(userDataStr) as User;
    const response = await api.get<BackendResponse<User>>(`/users/${sessionData.username}`);
    return response.data.data; 
  },

  getProfileByUsername: async (username: string): Promise<User> => {
    const response = await api.get<BackendResponse<User>>(`/users/${username}`);
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