import type { Post } from "../types/api.types";
import { MOCK_USER } from "./mockUser";

export const MOCK_POSTS: Post[] = [
  {
    id: "post_1",
    userId: MOCK_USER.id,
    content: "<p>Check out this amazing article on AI Engineering! <a href='https://writespace.com'>https://writespace.com</a> #AI</p><p>It really breaks down how the future of LLMs are shaping software architecture.</p>",
    media: [
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa"
    ],
    likesCount: 142,
    commentsCount: 23,
    createdAt: new Date().toISOString(),
    author: MOCK_USER
  },
  {
    id: "post_2",
    userId: "user_sarah_456",
    content: "<p>Just refactored our global state to use standard React Context instead of Redux. Here is the implementation we used for our Dark/Light theme toggle.</p>",
    codeSnippets: [
      { 
        language: "typescript", 
        code: "const ThemeContext = createContext<ThemeContextType | undefined>(undefined);\n\nexport const useTheme = () => {\n  const context = useContext(ThemeContext);\n  if (!context) throw new Error('useTheme must be used within ThemeProvider');\n  return context;\n};" 
      }
    ],
    likesCount: 312,
    commentsCount: 45,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    author: {
      id: "user_sarah_456",
      fullname: "Sarah Jenkins",
      username: "sarahj",
      email: "sarah@test.com",
      headline: "Senior Frontend Engineer @ TechFlow"
    }
  },
  {
    id: "post_3",
    userId: "user_marcus_789",
    media: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c"],
    likesCount: 89,
    commentsCount: 12,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    author: {
      id: "user_marcus_789",
      fullname: "Marcus Chen",
      username: "mchen",
      email: "marcus@dev.com",
      headline: "Backend Architect"
    }
  }
];