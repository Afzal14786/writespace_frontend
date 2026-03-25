
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
  language: string;
  code: string;
  title?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  content: string;
  excerpt?: string | null;
  media?: string[] | null;
  codeSnippets?: CodeSnippet[] | null; // Added codeSnippets
  coverImageUrl?: string | null;
  coverImageAltText?: string | null;
  tags?: string[] | null;
  authorId: string;
  
  // Added from your backend Drizzle joins
  author: {
    id: string;
    username: string;
    profileImageUrl?: string | null;
  };
  isLikedByMe: boolean; // Crucial for Optimistic UI

  status: "draft" | "published" | "archived";
  publishDate?: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  readTime?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostPayload {
  title: string;
  content: string;
  images?: File[]; 
  codeSnippets?: Omit<CodeSnippet, 'id'>[];
  tags?: string[];
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