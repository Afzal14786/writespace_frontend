
export interface User {
  id: string;
  fullname: string;
  username: string;
  email: string;
  bio?: string;
  headline?: string;
  location?: string;
  profileImageUrl?: string;
  profileImagePublicId?: string;
  bannerImageUrl?: string;
  bannerImagePublicId?: string;
  youtube?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  github?: string;
  website?: string;
  linkedin?: string;
  totalPosts?: number;
  totalReads?: number;
  totalFollowers?: number;
  totalFollowing?: number;
  status?: "active" | "suspended" | "banned";
  role?: "user" | "admin";
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Matches src/modules/auth/dtos/register.dto.ts
export interface RegisterPayload {
  fullname: string;
  username: string;
  email: string;
  password: string;
}

// Matches src/modules/auth/dtos/login.dto.ts
export interface LoginPayload {
  email: string;
  password: string;
}

// Matches src/modules/auth/dtos/verify-otp.dto.ts
export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

// Post Types
export interface CodeSnippet {
  id?: string;
  language: string;
  code: string;
}

export interface Post {
  id: string;
  userId: string;
  title?: string;
  content?: string;
  media?: string[];
  codeSnippets?: CodeSnippet[];
  likesCount: number;
  commentsCount: number;
  readTime?: number;
  createdAt: string;
  author: User;
  isLiked?: boolean;
  isLikedByMe?: boolean;
}

export interface CreatePostPayload {
  title: string;
  content: string;
  images?: File[]; 
  codeSnippets?: Omit<CodeSnippet, 'id'>[];
}

export interface CommentData {
  id: string;
  authorId: string;
  authorName: string;
  authorHeadline: string;
  content: string;
  likes: number;
  timeAgo: string;
  isLikedByMe?: boolean;
  replies?: CommentData[];
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}