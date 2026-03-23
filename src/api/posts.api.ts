import api from "./api.index";
import type { Post, CreatePostPayload } from "../types/api.types";

interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface PaginatedPosts {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const PostsAPI = {
  getFeed: async (sort: string = "recent", page: number = 1): Promise<PaginatedPosts> => {
    const response = await api.get<BackendResponse<PaginatedPosts>>(`/posts`, {
      params: { sort, page, limit: 20 }
    });
    return response.data.data;
  },

  getPostById: async (id: string): Promise<Post> => {
    const response = await api.get<BackendResponse<Post>>(`/posts/${id}`);
    return response.data.data;
  },

  createPost: async (payload: FormData | CreatePostPayload): Promise<Post> => {
    const isFormData = payload instanceof FormData;
    const response = await api.post<BackendResponse<Post>>("/posts", payload, {
      headers: {
        "Content-Type": isFormData ? "multipart/form-data" : "application/json",
      },
    });
    return response.data.data;
  },

  likePost: async (id: string): Promise<{ status: string; likesCount: number }> => {
    const response = await api.post<BackendResponse<{ status: string; likesCount: number }>>(`/posts/${id}/like`);
    return response.data.data;
  }
};