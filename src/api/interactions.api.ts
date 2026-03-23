import api from "./api.index";
import type { CommentData } from "../types/api.types";

interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface ToggleLikeResponse {
  isLiked: boolean;
  count: number;
}

export const InteractionsAPI = {
  toggleLike: async (postId: string): Promise<ToggleLikeResponse> => {
    const response = await api.post<BackendResponse<ToggleLikeResponse>>(`/posts/${postId}/like`);
    return response.data.data;
  },

  getComments: async (postId: string): Promise<CommentData[]> => {
    const response = await api.get<BackendResponse<CommentData[]>>(`/interactions/comments/${postId}`);
    return response.data.data;
  },

  addComment: async (postId: string, content: string, parentId?: string): Promise<CommentData> => {
    const response = await api.post<BackendResponse<CommentData>>(`/interactions/comments/${postId}`, { 
      content, 
      parentCommentId: parentId // Matches your backend Swagger docs exactly
    });
    return response.data.data;
  },

  sharePost: async (postId: string, platform?: string): Promise<void> => {
    await api.post<BackendResponse<null>>(`/posts/${postId}/share`, { platform });
  },

  updateComment: async (commentId: string, content: string): Promise<CommentData> => {
    const response = await api.put<BackendResponse<CommentData>>(`/interactions/comment/${commentId}`, { content });
    return response.data.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete<BackendResponse<null>>(`/interactions/comment/${commentId}`);
  },
};