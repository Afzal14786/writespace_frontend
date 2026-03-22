import api from "./api.index";
import { type CommentData } from "../types/api.types";

export const InteractionsAPI = {
  toggleLike: async (postId: string) => {
    const response = await api.post("/interactions/like", { postId });
    return response.data;
  },

  getComments: async (postId: string): Promise<CommentData[]> => {
    const response = await api.get(`/interactions/comments/${postId}`);
    return response.data.data;
  },

  addComment: async (postId: string, content: string, parentId?: string): Promise<CommentData> => {
    const response = await api.post("/interactions/comment", { postId, content, parentId });
    return response.data.data;
  },

  sharePost: async (postId: string) => {
    const response = await api.post("/interactions/share", { postId });
    return response.data;
  }
};