import React, { useState, useEffect, useRef } from "react";
import { User, ThumbsUp, MessageSquare, Repeat, Share2, MoreHorizontal, Link as LinkIcon, Twitter, Linkedin, Facebook, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "react-toastify";
import type { Post, CommentData } from "../../types/api.types";
import { InteractionsAPI } from "../../api/interactions.api";

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
}

const PostComponent: React.FC<PostComponentProps> = ({ post }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowWidth < 480;

  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(post.likesCount || 0);
  const [sharesCount, setSharesCount] = useState<number>(0); 
  const [isShareMenuOpen, setIsShareMenuOpen] = useState<boolean>(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  
  const [showComments, setShowComments] = useState<boolean>(false);
  
  const rawTextLength = post.content ? post.content.replace(/<[^>]*>?/gm, '').length : 0;
  const isLongPost = rawTextLength > 200; 
  const [isTextExpanded, setIsTextExpanded] = useState<boolean>(!isLongPost);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = isDark ? "#818cf8" : "#4f46e5";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setIsShareMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFollowToggle = () => {
    const authorName = post.author?.fullname || "this user";
    if (isFollowing) {
      setIsFollowing(false);
      toast.info(`Unfollowed ${authorName}`);
    } else {
      setIsFollowing(true);
      toast.success(`You are now following ${authorName}`);
    }
  };

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShareClick = async () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    if (navigator && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: "Post on Writespace", url: shareUrl });
        setSharesCount(prev => prev + 1);
      } catch (error) {
        const err = error as Error;
        if (err.name !== "AbortError") {
          toast.error("Sharing failed.");
        }
      }
    } else {
      setIsShareMenuOpen(!isShareMenuOpen);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast.success("Link copied to clipboard!");
    setSharesCount(prev => prev + 1);
    setIsShareMenuOpen(false);
  };

  const getLanguageExtension = (lang: string) => {
    switch (lang) {
      case "python": return [python()];
      case "rust": return [rust()];
      case "go": return [go()];
      case "cpp": return [cpp()];
      case "java": return [java()];
      case "sql": return [sql()];
      case "typescript": return [javascript({ typescript: true })];
      default: return [javascript()]; 
    }
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

  const shareMenuOptions = [
    { label: "Copy Link", icon: <LinkIcon size={16} />, action: copyToClipboard },
    { label: "Share on Twitter", icon: <Twitter size={16} />, action: () => { window.open(`https://twitter.com/intent/tweet?url=${window.location.origin}/post/${post.id}`, '_blank'); setIsShareMenuOpen(false); setSharesCount(s => s+1); } },
    { label: "Share on LinkedIn", icon: <Linkedin size={16} />, action: () => { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.origin}/post/${post.id}`, '_blank'); setIsShareMenuOpen(false); setSharesCount(s => s+1); } },
    { label: "Share on Facebook", icon: <Facebook size={16} />, action: () => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/post/${post.id}`, '_blank'); setIsShareMenuOpen(false); setSharesCount(s => s+1); } },
  ];

  const initialComments: CommentData[] = [
    {
      id: "c1",
      authorId: post.author?.id || "user_1", 
      authorName: post.author?.fullname || "Author",
      authorHeadline: post.author?.headline || "Engineer",
      content: "I added some new documentation to the GitHub repo regarding this update.",
      likes: 12,
      timeAgo: "1h",
      replies: []
    },
    {
      id: "c2",
      authorId: "random_user_99", 
      authorName: "Jane Doe",
      authorHeadline: "Frontend Developer",
      content: "This is a great breakdown! Thanks for sharing.",
      likes: 4,
      timeAgo: "2h",
      replies: []
    }
  ];

  return (
    <>
      <div style={{ 
        backgroundColor: cardBg, 
        borderRadius: "12px", 
        border: `1px solid ${borderColor}`, 
        color: textColor, 
        padding: isMobile ? "1rem" : "1rem 1.2rem", 
        boxShadow: isDark ? "0 4px 6px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.05)", 
        fontFamily: "Inter, sans-serif",
        marginTop: 0,
        marginBottom: 0 
      }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", gap: "12px", minWidth: 0, flex: 1 }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: isDark ? "#334155" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              {post.author?.profileImage ? <img src={post.author.profileImage} alt={post.author.fullname} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={24} color={mutedText} />}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
              <span style={{ fontWeight: 600, fontSize: "1rem", color: textColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {post.author?.fullname || "Unknown User"}
              </span>
              <span style={{ fontSize: "0.8rem", color: mutedText, marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                {post.author?.headline || "Member"}
              </span>
              <span style={{ fontSize: "0.75rem", color: mutedText, marginTop: "2px" }}>
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button onClick={handleFollowToggle} style={{ background: "none", border: "none", padding: "6px 10px", color: isFollowing ? mutedText : accentColor, fontWeight: 600, cursor: "pointer", fontSize: "0.85rem", borderRadius: "20px" }}>
              {isFollowing ? "Following" : "+ Follow"}
            </button>
            <button style={{ background: "none", border: "none", color: mutedText, cursor: "pointer", padding: "4px" }}><MoreHorizontal size={20} /></button>
          </div>
        </div>

        {post.content && (
          <div>
            <div 
              className="tiptap-content" 
              style={{ 
                fontSize: "0.95rem", lineHeight: "1.6", color: isDark ? "rgba(255,255,255,0.9)" : "#334155", wordBreak: "break-word",
                display: isTextExpanded ? "block" : "-webkit-box",
                WebkitLineClamp: isTextExpanded ? "unset" : 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }} 
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
            {!isTextExpanded && (
              <button 
                onClick={() => setIsTextExpanded(true)} 
                style={{ background: "none", border: "none", color: mutedText, cursor: "pointer", padding: "4px 0", fontSize: "0.9rem", fontWeight: 600, display: "block" }}
              >
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
            <span>{post.commentsCount + initialComments.length} comments</span>
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
          
          <div ref={shareMenuRef} style={{ position: "relative" }}>
            <button onClick={handleShareClick} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: isShareMenuOpen ? accentColor : mutedText, fontSize: "0.85rem", fontWeight: 600, padding: "8px", borderRadius: "8px", cursor: "pointer" }}>
              <Share2 size={18} /> 
              {!isMobile && <span>Share</span>} 
              {sharesCount > 0 && <span style={{ color: accentColor }}>{sharesCount}</span>}
            </button>

            {isShareMenuOpen && (
              <div style={{ position: "absolute", bottom: "100%", right: 0, marginBottom: "8px", backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: "8px", padding: "8px", display: "flex", flexDirection: "column", gap: "4px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", zIndex: 10, width: "200px", animation: "fadeIn 0.2s" }}>
                {shareMenuOptions.map((opt, i) => (
                  <button key={i} onClick={opt.action} style={{ display: "flex", alignItems: "center", gap: "12px", background: "none", border: "none", color: textColor, padding: "10px", width: "100%", textAlign: "left", cursor: "pointer", borderRadius: "4px", fontSize: "0.85rem" }} onMouseOver={e => e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"} onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}>
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {showComments && (
          <CommentSection 
            postId={post.id} 
            postAuthorId={post.author?.id || "user_1"} 
            initialComments={initialComments} 
          />
        )}
      </div>

      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)} 
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s" }}
        >
          <button 
            onClick={() => setSelectedImage(null)} 
            style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: "50%", padding: "8px", cursor: "pointer" }}
          >
            <X size={24} />
          </button>
          <img 
            src={selectedImage} 
            alt="Expanded view" 
            style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", borderRadius: "8px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }} 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </>
  );
};

export default PostComponent;