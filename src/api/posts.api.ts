import api from "./api.index";
import { type Post, type CreatePostPayload } from "../types/api.types";

export const PostsAPI = {
  createPost: async (payload: CreatePostPayload): Promise<Post> => {
    const formData = new FormData();
    if (payload.content) formData.append("content", payload.content);
    
    // Append images for the upload middleware
    payload.images?.forEach((file) => {
      formData.append("media", file);
    });

    // Append code snippets as stringified JSON
    if (payload.codeSnippets) {
      formData.append("codeSnippets", JSON.stringify(payload.codeSnippets));
    }

    const response = await api.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getFeed: async (sortBy: string = "recent", page: number = 1): Promise<Post[]> => {
    const response = await api.get("/posts", {
      params: { sort: sortBy, page }
    });
    return response.data.data; // Backend wraps in standard api-response
  },

  getPostById: async (postId: string): Promise<Post> => {
    const response = await api.get(`/posts/${postId}`);
    return response.data.data;
  },

  deletePost: async (postId: string) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  }
};