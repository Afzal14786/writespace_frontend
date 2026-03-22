import api from "./api.index";
import type { CommentData } from "../types/api.types";

interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export const InteractionsAPI = {
  toggleLike: async (postId: string): Promise<void> => {
    await api.post<BackendResponse<null>>("/interactions/like", { postId });
  },

  getComments: async (postId: string): Promise<CommentData[]> => {
    const response = await api.get<BackendResponse<CommentData[]>>(`/interactions/comments/${postId}`);
    return response.data.data;
  },

  addComment: async (postId: string, content: string, parentId?: string): Promise<CommentData> => {
    const response = await api.post<BackendResponse<CommentData>>("/interactions/comment", { 
      postId, 
      content, 
      parentId 
    });
    return response.data.data;
  },

  sharePost: async (postId: string): Promise<void> => {
    await api.post<BackendResponse<null>>("/interactions/share", { postId });
  }
};