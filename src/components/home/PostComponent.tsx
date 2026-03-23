import React, { useState, useEffect, useRef } from "react";
import { User, ThumbsUp, MessageSquare, Repeat, Share2, MoreHorizontal, Link as LinkIcon, Twitter, Linkedin, Facebook, X, Trash2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import type { Post } from "../../types/api.types";
import { InteractionsAPI } from "../../api/interactions.api";
import { PostsAPI } from "../../api/posts.api";

import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { githubLight } from '@uiw/codemirror-theme-github';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { rust } from '@codemirror/lang-rust';
import { go } from '@codemirror/lang-go';
import { sql } from '@codemirror/lang-sql';
import { java } from '@codemirror/lang-java';

import CommentSection from "./CommentSection";

interface PostComponentProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
}

const PostComponent: React.FC<PostComponentProps> = ({ post, onPostDeleted }) => {
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const isDark = theme === "dark";

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowWidth < 480;

  const [isFollowing, setIsFollowing] = useState<boolean>(false); 
  const [isLiked, setIsLiked] = useState<boolean>(post.isLikedByMe || post.isLiked || false);
  const [likesCount, setLikesCount] = useState<number>(post.likesCount || 0);
  const [sharesCount, setSharesCount] = useState<number>(0); 
  
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);
  
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  
  const rawTextLength = post.content ? post.content.replace(/<[^>]*>?/gm, '').length : 0;
  const isLongPost = rawTextLength > 200; 
  const [isTextExpanded, setIsTextExpanded] = useState<boolean>(!isLongPost);
  
  // 🔥 CLEANED: State is actively used for viewing full-size images
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const isOwnPost = authUser?.username === post.author?.username;
  
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = isDark ? "#818cf8" : "#4f46e5";

  useEffect(() => {
    document.body.style.overflow = isShareModalOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isShareModalOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setIsOptionsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? `Unfollowed ${post.author.fullname}` : `Following ${post.author.fullname}`);
  };

  const handleLikeToggle = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      const response = await InteractionsAPI.toggleLike(post.id);
      if (response) {
        setLikesCount(response.count ?? (newLikedState ? likesCount + 1 : likesCount - 1));
        setIsLiked(response.isLiked ?? newLikedState);
      }
    } catch (error) {
      console.error(error);
      setIsLiked(!newLikedState);
      setLikesCount(prev => newLikedState ? prev - 1 : prev + 1);
      toast.error("Failed to like post.");
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await PostsAPI.deletePost(post.id);
      setIsDeleted(true);
      toast.success("Post deleted.");
      if (onPostDeleted) onPostDeleted(post.id);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete post.");
    }
  };

  const handleShareSubmit = async (platform: string, url: string) => {
    setIsShareModalOpen(false);
    try {
      if (platform === "copy") {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      } else if (platform === "native" && navigator.share) {
        await navigator.share({ title: "Post on Writespace", url });
      } else {
        window.open(url, '_blank');
      }
      await InteractionsAPI.sharePost(post.id, platform); 
      setSharesCount(prev => prev + 1);
    } catch (error: unknown) {
      const err = error as Error;
      if (err.name !== "AbortError") toast.error("Sharing failed.");
    }
  };

  const getLanguageExtension = (lang: string) => {
    switch (lang) { case "python": return [python()]; case "rust": return [rust()]; case "go": return [go()]; case "cpp": return [cpp()]; case "java": return [java()]; case "sql": return [sql()]; case "typescript": return [javascript({ typescript: true })]; default: return [javascript()]; }
  };

  const renderImageGrid = (media: string[]) => {
    if (!media || media.length === 0) return null;
    const count = media.length;
    let gridTemplate = "1fr"; 
    if (count === 2) gridTemplate = "1fr 1fr";
    if (count === 3) gridTemplate = "1fr 1fr 1fr"; 
    if (count >= 4) gridTemplate = "1fr 1fr"; 

    return (
      <div style={{ display: "grid", gap: "4px", marginTop: "12px", gridTemplateColumns: gridTemplate, borderRadius: "8px", overflow: "hidden" }}>
        {media.slice(0, 4).map((img, idx) => (
          <div key={idx} onClick={() => setSelectedImage(img)} style={{ position: "relative", paddingTop: count === 1 ? "56.25%" : "100%", backgroundColor: "#000", cursor: "pointer" }}>
            <img src={img} alt={`Post media ${idx}`} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            {idx === 3 && count > 4 && (
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.5rem", fontWeight: "bold" }}>
                +{count - 4}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isDeleted) return null;

  const shareUrl = `${window.location.origin}/post/${post.id}`;

  return (
    <>
      <div style={{ backgroundColor: cardBg, borderRadius: "12px", border: `1px solid ${borderColor}`, color: textColor, padding: isMobile ? "1rem" : "1rem 1.2rem", boxShadow: isDark ? "0 4px 6px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.05)", fontFamily: "Inter, sans-serif", marginTop: 0, marginBottom: 0 }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", gap: "12px", minWidth: 0, flex: 1 }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: isDark ? "#334155" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              {post.author?.profileImageUrl ? <img src={post.author.profileImageUrl} alt={post.author.fullname} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={24} color={mutedText} />}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontWeight: 600, fontSize: "1rem", color: textColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {post.author?.fullname || "Unknown User"}
                </span>
                <span style={{ fontSize: "0.85rem", color: mutedText, fontWeight: 500 }}>
                  @{post.author?.username}
                </span>
              </div>
              <span style={{ fontSize: "0.8rem", color: mutedText, marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                {post.author?.headline || "Writespace Member"}
              </span>
              
              <span style={{ fontSize: "0.75rem", color: mutedText, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                {new Date(post.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} 
                • {post.readTime || 1} min read
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {!isOwnPost && (
              <button onClick={handleFollowToggle} style={{ background: "none", border: "none", padding: "6px 10px", color: isFollowing ? mutedText : accentColor, fontWeight: 600, cursor: "pointer", fontSize: "0.85rem", borderRadius: "20px" }}>
                {isFollowing ? "Following" : "+ Follow"}
              </button>
            )}
            
            {isOwnPost && (
              <div style={{ position: "relative" }} ref={optionsMenuRef}>
                <button onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)} style={{ background: "none", border: "none", color: mutedText, cursor: "pointer", padding: "4px" }}>
                  <MoreHorizontal size={20} />
                </button>
                
                {isOptionsMenuOpen && (
                  <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "8px", backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 10, width: "140px", overflow: "hidden" }}>
                    <button onClick={handleDeletePost} style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>
                      <Trash2 size={16} /> Delete Post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {post.title && (
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: textColor, margin: "0 0 10px 0", lineHeight: "1.4" }}>
            {post.title}
          </h2>
        )}

        {post.content && (
          <div>
            <div 
              className="tiptap-content" 
              style={{ fontSize: "0.95rem", lineHeight: "1.6", color: isDark ? "rgba(255,255,255,0.9)" : "#334155", wordBreak: "break-word", display: isTextExpanded ? "block" : "-webkit-box", WebkitLineClamp: isTextExpanded ? "unset" : 3, WebkitBoxOrient: "vertical", overflow: "hidden" }} 
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
            {!isTextExpanded && (
              <button onClick={() => setIsTextExpanded(true)} style={{ background: "none", border: "none", color: mutedText, cursor: "pointer", padding: "4px 0", fontSize: "0.9rem", fontWeight: 600, display: "block" }}>
                ...see more
              </button>
            )}
          </div>
        )}

        {post.codeSnippets && post.codeSnippets.map((snippet, idx) => (
          <div key={idx} style={{ marginTop: "12px", borderRadius: "8px", overflow: "hidden", border: `1px solid ${borderColor}` }}>
            <div style={{ backgroundColor: isDark ? "#1e293b" : "#e2e8f0", padding: "4px 12px", fontSize: "0.75rem", color: mutedText, fontWeight: 600, textTransform: "uppercase" }}>{snippet.language}</div>
            <CodeMirror value={snippet.code} height="auto" readOnly={true} theme={isDark ? vscodeDark : githubLight} extensions={getLanguageExtension(snippet.language)} style={{ fontSize: "0.85rem" }} />
          </div>
        ))}

        {renderImageGrid(post.media || [])}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingBottom: "8px", borderBottom: `1px solid ${borderColor}`, fontSize: "0.8rem", color: mutedText }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ backgroundColor: "#3b82f6", borderRadius: "50%", padding: "4px", display: "flex" }}><ThumbsUp size={10} color="#fff" fill="#fff" /></div>
            <span>{likesCount}</span>
          </div>
          <div>
            <span>{post.commentsCount || 0} comments</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", flexWrap: "wrap", gap: "4px" }}>
          <button onClick={handleLikeToggle} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: isLiked ? "#3b82f6" : mutedText, fontSize: "0.85rem", fontWeight: 600, padding: "8px", borderRadius: "8px", cursor: "pointer" }}>
            <ThumbsUp size={18} fill={isLiked ? "#3b82f6" : "none"} /> {!isMobile && <span>Like</span>}
          </button>
          
          <button onClick={() => setShowComments(!showComments)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: mutedText, fontSize: "0.85rem", fontWeight: 600, padding: "8px", borderRadius: "8px", cursor: "pointer" }}>
            <MessageSquare size={18} /> {!isMobile && <span>Comment</span>}
          </button>
          
          <button onClick={() => toast.info("Repost coming soon!")} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: mutedText, fontSize: "0.85rem", fontWeight: 600, padding: "8px", borderRadius: "8px", cursor: "pointer" }}>
            <Repeat size={18} /> {!isMobile && <span>Repost</span>}
          </button>
          
          <button onClick={() => setIsShareModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: mutedText, fontSize: "0.85rem", fontWeight: 600, padding: "8px", borderRadius: "8px", cursor: "pointer" }}>
            <Share2 size={18} /> 
            {!isMobile && <span>Share</span>} 
            {sharesCount > 0 && <span style={{ color: accentColor }}>{sharesCount}</span>}
          </button>
        </div>

        {showComments && (
          <CommentSection 
            postId={post.id} 
            postAuthorUsername={post.author?.username || ""} 
          />
        )}
      </div>

      {isShareModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s", padding: "16px" }}>
          <div style={{ backgroundColor: cardBg, borderRadius: "16px", width: "100%", maxWidth: "400px", padding: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.3)", position: "relative" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: textColor, fontSize: "1.2rem", fontWeight: 700 }}>Share Post</h3>
              <button onClick={() => setIsShareModalOpen(false)} style={{ background: "none", border: "none", color: mutedText, cursor: "pointer", padding: "4px" }}><X size={20}/></button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <button onClick={() => handleShareSubmit("twitter", `https://twitter.com/intent/tweet?url=${shareUrl}`)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#1DA1F2", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><Twitter size={24} fill="white" /></div>
                <span style={{ fontSize: "0.8rem", color: textColor, fontWeight: 500 }}>Twitter</span>
              </button>
              <button onClick={() => handleShareSubmit("linkedin", `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#0A66C2", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><Linkedin size={24} fill="white" /></div>
                <span style={{ fontSize: "0.8rem", color: textColor, fontWeight: 500 }}>LinkedIn</span>
              </button>
              <button onClick={() => handleShareSubmit("facebook", `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#1877F2", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><Facebook size={24} fill="white" /></div>
                <span style={{ fontSize: "0.8rem", color: textColor, fontWeight: 500 }}>Facebook</span>
              </button>
            </div>

            <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: "20px" }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: mutedText, fontWeight: 600 }}>Or copy link</p>
              <div style={{ display: "flex", alignItems: "center", backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "#f1f5f9", borderRadius: "8px", border: `1px solid ${borderColor}`, padding: "4px 4px 4px 12px" }}>
                <LinkIcon size={16} color={mutedText} style={{ flexShrink: 0 }} />
                <input type="text" readOnly value={shareUrl} style={{ flex: 1, background: "transparent", border: "none", color: textColor, outline: "none", padding: "8px", fontSize: "0.85rem", textOverflow: "ellipsis" }} />
                <button onClick={() => handleShareSubmit("copy", shareUrl)} style={{ backgroundColor: accentColor, color: "white", border: "none", borderRadius: "6px", padding: "8px 16px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", flexShrink: 0 }}>
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 The state variable `selectedImage` is read exactly here */}
      {selectedImage && (
        <div onClick={() => setSelectedImage(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s" }}>
          <button onClick={() => setSelectedImage(null)} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: "50%", padding: "8px", cursor: "pointer" }}><X size={24} /></button>
          <img src={selectedImage} alt="Expanded view" style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", borderRadius: "8px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
};

export default PostComponent;