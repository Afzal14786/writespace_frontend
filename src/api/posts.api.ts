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

  createPost: async (payload: CreatePostPayload): Promise<Post> => {
    // If the user attached images, we MUST use FormData
    if (payload.images && payload.images.length > 0) {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("content", payload.content);
      
      payload.images.forEach(file => formData.append("media", file));
      
      if (payload.codeSnippets && payload.codeSnippets.length > 0) {
        formData.append("codeSnippets", JSON.stringify(payload.codeSnippets));
      }

      const response = await api.post<BackendResponse<Post>>("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } 
    
    else {
      const jsonPayload = {
        title: payload.title,
        content: payload.content,
        codeSnippets: payload.codeSnippets,
        isPublished: true
      };
      
      const response = await api.post<BackendResponse<Post>>("/posts", jsonPayload);
      return response.data.data;
    }
  },

  likePost: async (id: string): Promise<{ status: string; likesCount: number }> => {
    const response = await api.post<BackendResponse<{ status: string; likesCount: number }>>(`/posts/${id}/like`);
    return response.data.data;
  },

  updatePost: async (postId: string, payload: Partial<CreatePostPayload>): Promise<Post> => {
    const response = await api.put<BackendResponse<Post>>(`/posts/${postId}`, payload);
    return response.data.data;
  },

  deletePost: async (postId: string): Promise<void> => {
    await api.delete<BackendResponse<null>>(`/posts/${postId}`);
  }
};