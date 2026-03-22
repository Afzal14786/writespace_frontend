import api from "./api.index";
import { type User } from "../types/api.types";

export const UsersAPI = {
  getMe: async (): Promise<User> => {
    const response = await api.get("/users/me");
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch("/users/profile", data);
    return response.data;
  }
};