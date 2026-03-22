import type { Post } from "../types/api.types";
import { MOCK_USER } from "./mockUser";

export const MOCK_POSTS: Post[] = [
  {
    id: "post_1",
    userId: MOCK_USER.id,
    content: "<p>Check out this amazing article on AI Engineering! <a href='https://writespace.com'>https://writespace.com</a> #AI</p><p>It really breaks down how the future of LLMs are shaping software architecture.</p>",
    media: [
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
      "https://images.unsplash.com/photo-1555099962-4199c345e5dd"
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
    media: [
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
      "https://images.unsplash.com/photo-1555099962-4199c345e5dd",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
    ],
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
  },
  {
    id: "post_4",
    userId: "user_alex_101",
    content: "<p>What is your preferred method for managing background tasks in Node.js? Redis + BullMQ or standard cron jobs? Let me know below! 👇</p>",
    likesCount: 56,
    commentsCount: 8,
    createdAt: new Date(Date.now() - 200000000).toISOString(),
    author: {
      id: "user_alex_101",
      fullname: "Alex Rivera",
      username: "arivera",
      email: "alex@test.com",
      headline: "Node.js Evangelist"
    }
  },
  {
    id: "post_5",
    userId: "user_david_202",
    content: "<p>Finally deployed our new architecture using Rust. The performance gains are literally unbelievable. Look at this memory management:</p>",
    codeSnippets: [
      {
        language: "rust",
        code: "fn main() {\n    let mut numbers = vec![1, 2, 3];\n    numbers.push(4);\n    println!(\"{:?}\", numbers);\n}"
      }
    ],
    media: ["https://images.unsplash.com/photo-1555099962-4199c345e5dd"],
    likesCount: 412,
    commentsCount: 67,
    createdAt: new Date(Date.now() - 300000000).toISOString(),
    author: {
      id: "user_david_202",
      fullname: "David Kim",
      username: "dkim_systems",
      email: "david@rust.org",
      headline: "Systems Engineer | Rustacean"
    }
  },
  {
    id: "post_6",
    userId: "user_emily_303",
    content: "<p>A rare moment of peace at the desk before diving into the new sprint. ☕💻</p>",
    media: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      "https://images.unsplash.com/photo-1555099962-4199c345e5dd",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      "https://images.unsplash.com/photo-1555099962-4199c345e5dd",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
    ],
    likesCount: 201,
    commentsCount: 14,
    createdAt: new Date(Date.now() - 400000000).toISOString(),
    author: {
      id: "user_emily_303",
      fullname: "Emily Watson",
      username: "emily_ui",
      email: "emily@design.com",
      headline: "UI/UX Designer & Developer"
    }
  },
  {
    id: "post_7",
    userId: MOCK_USER.id,
    content: "<p>Here is a quick Python snippet I wrote to automate some boring data extraction tasks yesterday! Just refactored our global state to use standard React Context instead of Redux. Here is the implementation we used for our Dark/Light theme toggle.Just refactored our global state to use standard React Context instead of Redux. Here is the implementation we used for our Dark/Light theme toggle.Just refactored our global state to use standard React Context instead of Redux. Here is the implementation we used for our Dark/Light theme toggle.Just refactored our global state to use standard React Context instead of Redux. Here is the implementation we used for our Dark/Light theme toggle.Just refactored our global state to use standard React Context instead of Redux. Here is the implementation we used for our Dark/Light theme toggle.</p>",
    codeSnippets: [
      {
        language: "python",
        code: "import pandas as pd\n\ndef clean_data(file_path):\n    df = pd.read_csv(file_path)\n    return df.dropna()\n\nprint(clean_data('data.csv'))"
      }
    ],
    likesCount: 88,
    commentsCount: 4,
    createdAt: new Date(Date.now() - 500000000).toISOString(),
    author: MOCK_USER
  }
];