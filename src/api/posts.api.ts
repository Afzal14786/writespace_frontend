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
    limit: number;
    nextCursor: string | null;
  };
}

export const PostsAPI = {
  getFeed: async (sort: string = "recent", cursor: string | null = null): Promise<PaginatedPosts> => {
    const params: Record<string, string | number> = { sort, limit: 20 };
    
    // Only attach the cursor if it exists (i.e., not the first load)
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await api.get<BackendResponse<PaginatedPosts>>(`/posts`, { params });
    return response.data.data;
  },

  getPostById: async (id: string): Promise<Post> => {
    const response = await api.get<BackendResponse<Post>>(`/posts/${id}`);
    return response.data.data;
  },

  createPost: async (payload: CreatePostPayload): Promise<Post> => {
    if (payload.images && payload.images.length > 0) {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("content", payload.content);
      formData.append("isPublished", "true");
      formData.append("banner", payload.images[0]); 
      
      if (payload.codeSnippets && payload.codeSnippets.length > 0) {
        formData.append("codeSnippets", JSON.stringify(payload.codeSnippets));
      }

      if (payload.tags && payload.tags.length > 0) {
        formData.append("tags", JSON.stringify(payload.tags));
      }

      const response = await api.post<BackendResponse<Post>>("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } else {
      const jsonPayload = {
        title: payload.title,
        content: payload.content,
        codeSnippets: payload.codeSnippets,
        tags: payload.tags,
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