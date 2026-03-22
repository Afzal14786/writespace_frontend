import React, { useEffect, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

import ProfileSidebar from "../../components/home/ProfileSidebar";
import TrendingSidebar from "../../components/home/TrendingSidebar";
import CreatePostEditor from "../../components/home/CreatePostEditor";
import PostComponent from "../../components/home/PostComponent";
import type { Post } from "../../types/api.types";

const DUMMY_POSTS: Post[] = [
  {
    id: "post_1",
    userId: "user_1",
    content: "<p>Check out this amazing article on AI Engineering! <a href='https://writespace.com'>https://writespace.com</a> #AI</p><p>It really breaks down how the future of LLMs are shaping software architecture.</p>",
    media: [
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa"
    ],
    likesCount: 142,
    commentsCount: 23,
    createdAt: new Date().toISOString(),
    author: { id: "user_1", fullname: "Afzal", username: "afzal_dev", email: "test@test.com", headline: "Aspiring AI Engineer | MERN Stack" }
  },
  {
    id: "post_2",
    userId: "user_2",
    content: "<p>Just refactored our global state. Here is the implementation we used for our Dark/Light theme toggle.</p>",
    codeSnippets: [
      { id: "1", language: "typescript", code: "const ThemeContext = createContext<ThemeContextType | undefined>(undefined);\n\nexport const useTheme = () => {\n  const context = useContext(ThemeContext);\n  if (!context) throw new Error('Error');\n  return context;\n};" }
    ],
    likesCount: 312,
    commentsCount: 45,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    author: { id: "user_2", fullname: "Sarah Jenkins", username: "sarahj", email: "sarah@test.com", headline: "Senior Frontend Engineer" }
  },
  {
    id: "post_3",
    userId: "user_3",
    // Image ONLY post
    media: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c"
    ],
    likesCount: 89,
    commentsCount: 5,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    author: { id: "user_3", fullname: "Marcus Dev", username: "marcus", email: "marcus@test.com", headline: "Community Manager @ TechHub" }
  },
  {
    id: "post_4",
    userId: "user_4",
    // Code ONLY post
    codeSnippets: [
      { id: "2", language: "python", code: "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint([fibonacci(i) for i in range(10)])" }
    ],
    likesCount: 24,
    commentsCount: 2,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    author: { id: "user_4", fullname: "Elena Rust", username: "elena", email: "elena@test.com", headline: "Backend Systems Engineer" }
  }
];

const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sortBy, setSortBy] = useState<"Recent" | "Top" | "Discussed">("Recent");
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  const [posts] = useState<Post[]>(DUMMY_POSTS);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = "#6366f1";

  const layoutStyle: React.CSSProperties = {
    maxWidth: "1200px", 
    margin: "0 auto", 
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : isTablet ? "250px 1fr" : "225px 1fr 275px",
    gap: "1rem",
    alignItems: "start",
  };

  return (
    <div style={{ paddingTop: "80px", paddingLeft: "1rem", paddingRight: "1rem", paddingBottom: "2rem" }}>
      <div style={layoutStyle}>
        
        {!isMobile && (
          <div style={{ position: "sticky", top: "80px" }}>
            <ProfileSidebar />
          </div>
        )}

        <main style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          <CreatePostEditor onPostCreated={() => console.log("Post created")} />

          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 8px", position: "relative" }}>
            <div style={{ height: "1px", backgroundColor: borderColor, flex: 1 }} />
            <div 
              style={{ fontSize: "0.8rem", color: mutedText, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", position: "relative" }}
              onClick={() => setIsSortOpen(!isSortOpen)}
            >
              Sort by: <strong style={{ color: textColor }}>{sortBy}</strong>
              <ChevronDown size={14} color={mutedText} style={{ transform: isSortOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              
              {isSortOpen && (
                <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "8px", width: "140px", backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 10, overflow: "hidden" }}>
                  {["Recent", "Top", "Discussed"].map((option) => (
                    <div 
                      key={option} onClick={() => { setSortBy(option as any); setIsSortOpen(false); }}
                      style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", color: textColor, fontWeight: sortBy === option ? 600 : 400, borderBottom: `1px solid ${borderColor}`, cursor: "pointer" }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      {option} {sortBy === option && <Check size={14} color={accentColor} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {posts.map(post => (
              <PostComponent key={post.id} post={post} />
            ))}
          </div>

        </main>

        {!isMobile && !isTablet && (
          <div style={{ position: "sticky", top: "80px" }}>
            <TrendingSidebar />
          </div>
        )}

      </div>
    </div>
  );
};

export default HomePage;