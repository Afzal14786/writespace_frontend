import api from "./api.index";
import type { Post, CreatePostPayload } from "../types/api.types";

interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export const PostsAPI = {
  createPost: async (payload: CreatePostPayload): Promise<Post> => {
    const formData = new FormData();
    
    if (payload.content) {
      formData.append("content", payload.content);
    }
    
    if (payload.images && payload.images.length > 0) {
      payload.images.forEach((file) => {
        formData.append("media", file);
      });
    }

    if (payload.codeSnippets && payload.codeSnippets.length > 0) {
      formData.append("codeSnippets", JSON.stringify(payload.codeSnippets));
    }

    const response = await api.post<BackendResponse<Post>>("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    return response.data.data;
  },

  getFeed: async (sortBy: string = "recent", page: number = 1): Promise<Post[]> => {
    const response = await api.get<BackendResponse<Post[]>>(`/posts`, {
      params: { sort: sortBy, page }
    });
    return response.data.data;
  },

  getPostById: async (postId: string): Promise<Post> => {
    const response = await api.get<BackendResponse<Post>>(`/posts/${postId}`);
    return response.data.data;
  },

  deletePost: async (postId: string): Promise<void> => {
    await api.delete<BackendResponse<null>>(`/posts/${postId}`);
  }
};