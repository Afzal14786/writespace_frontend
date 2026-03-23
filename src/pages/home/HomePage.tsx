import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "react-toastify";

import ProfileSidebar from "../../components/home/ProfileSidebar";
import TrendingSidebar from "../../components/home/TrendingSidebar";
import CreatePostEditor from "../../components/home/CreatePostEditor";
import PostComponent from "../../components/home/PostComponent";
import type { Post } from "../../types/api.types";
import { PostsAPI } from "../../api/posts.api"; 

import { MOCK_POSTS } from "../../data/mockPosts";

// FIX: Strictly type the sorting options
type SortOption = "Recent" | "Top" | "Discussed";
const SORT_OPTIONS: SortOption[] = ["Recent", "Top", "Discussed"];

const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [sortBy, setSortBy] = useState<SortOption>("Recent");
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const toastTriggered = useRef<boolean>(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let isMounted = true;
    toastTriggered.current = false;

    const fetchFeed = async () => {
      try {
        setIsLoading(true);
        const feedResponse = await PostsAPI.getFeed(sortBy.toLowerCase(), 1);
        
        if (isMounted) {
          setPosts(feedResponse.posts || []);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching feed, falling back to mock data:", error);
          setPosts(MOCK_POSTS);
          
          if (!toastTriggered.current) {
            toast.error("Failed to load real posts. Showing test data.");
            toastTriggered.current = true;
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFeed();

    return () => {
      isMounted = false;
    };
  }, [sortBy]);

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
    gridTemplateColumns: isMobile 
      ? "minmax(0, 1fr)" 
      : isTablet 
      ? "250px minmax(0, 1fr)" 
      : "225px minmax(0, 1fr) 275px",
    gap: "1rem", 
    alignItems: "start"
  };

  const handlePostCreated = () => {
    setSortBy("Recent"); 
  };

  return (
    <div style={{ paddingTop: "72px", paddingLeft: isMobile ? "0.5rem" : "1rem", paddingRight: isMobile ? "0.5rem" : "1rem", paddingBottom: "2rem" }}>
      <div style={layoutStyle}>
        
        {!isMobile && (
          <div style={{ position: "sticky", top: "72px" }}>
            <ProfileSidebar />
          </div>
        )}

        <main style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: 0 }}>
          
          <CreatePostEditor onPostCreated={handlePostCreated} />

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
                  {/* FIX: Now maps over strictly typed SORT_OPTIONS instead of raw strings */}
                  {SORT_OPTIONS.map((option) => (
                    <div 
                      key={option} 
                      onClick={() => { setSortBy(option); setIsSortOpen(false); }}
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
            {isLoading ? (
               <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                 <Loader2 size={32} className="animate-spin" style={{ color: accentColor }} />
               </div>
            ) : posts.length > 0 ? (
               posts.map(post => <PostComponent key={post.id} post={post} />)
            ) : (
               <div style={{ textAlign: "center", color: mutedText, padding: "2rem", backgroundColor: cardBg, borderRadius: "12px", border: `1px solid ${borderColor}` }}>
                 No posts found. Start writing!
               </div>
            )}
          </div>

        </main>

        {!isMobile && !isTablet && (
          <div style={{ position: "sticky", top: "72px" }}>
            <TrendingSidebar />
          </div>
        )}

      </div>
    </div>
  );
};

export default HomePage;