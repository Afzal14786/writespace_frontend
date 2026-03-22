import React, { useState, useEffect, useCallback } from "react";
import { User, Send, Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "react-toastify";
import type { CommentData } from "../../types/api.types";
import { InteractionsAPI } from "../../api/interactions.api";

interface CommentSectionProps {
  postId: string;
  postAuthorId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, postAuthorId }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // State Management
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowWidth < 480;

  // Colors & Styles
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = isDark ? "#818cf8" : "#4f46e5";
  const inputBg = isDark ? "rgba(0,0,0,0.3)" : "#f3f4f6";
  const authorBadgeBg = isDark ? "#334155" : "#e2e8f0";

  // 1. Fetch Comments for this specific Post
  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await InteractionsAPI.getComments(postId); 
      setComments(response || []);
    } catch (error) {
      console.error("Failed to fetch comments", error);
      // toast.error("Could not load comments");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 2. Add Top-level Comment
  const handleAddComment = async () => {
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await InteractionsAPI.addComment(postId, commentText);
      // Assuming response returns the new comment object
      setComments([response, ...comments]);
      setCommentText("");
      toast.success("Comment posted");
    } catch (error) {
      console.log(error);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Add Reply (Nested)
  const handleAddReply = async (parentId: string) => {
    if (!replyText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Backend Alignment: Pass parentId to create a nested relation
      const response = await InteractionsAPI.addComment(postId, replyText, parentId);
      
      const addReplyToTree = (list: CommentData[]): CommentData[] => {
        return list.map(c => {
          if (c.id === parentId) {
            return { ...c, replies: [response, ...(c.replies || [])] };
          }
          if (c.replies) {
            return { ...c, replies: addReplyToTree(c.replies) };
          }
          return c;
        });
      };

      setComments(addReplyToTree(comments));
      setReplyText("");
      setReplyingTo(null);
      toast.success("Reply posted");
    } catch (error) {
      console.log(error);
      toast.error("Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Toggle Like on Comment
  const handleCommentLike = async (commentId: string) => {
    try {
      // await InteractionsAPI.toggleCommentLike(commentId);
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          const isLiked = c.isLikedByMe;
          return { ...c, likes: isLiked ? c.likes - 1 : c.likes + 1, isLikedByMe: !isLiked };
        }
        return c;
      }));
    } catch (error) {
      console.log(error);
      toast.error("Action failed");
    }
  };

  const renderComment = (comment: CommentData, depth = 0) => {
    const visualDepth = isMobile ? Math.min(depth, 1) : depth;
    const marginLeft = visualDepth * (isMobile ? 12 : 24);
    const isAuthor = comment.authorId === postAuthorId;

    return (
      <div key={comment.id} style={{ marginTop: "16px", marginLeft: `${marginLeft}px`, position: "relative" }}>
        {depth > 0 && (
          <div style={{ 
            position: "absolute", left: isMobile ? "-10px" : "-20px", 
            top: "-16px", bottom: "20px", width: "2px", 
            backgroundColor: borderColor, borderRadius: "1px"
          }} />
        )}
        
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: isDark ? "#334155" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
            <User size={16} color={mutedText} />
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ backgroundColor: inputBg, padding: "10px 14px", borderRadius: "0 12px 12px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.85rem", color: textColor }}>{comment.authorName}</span>
                    {isAuthor && (
                      <span style={{ backgroundColor: authorBadgeBg, color: textColor, fontSize: "0.6rem", fontWeight: 700, padding: "1px 6px", borderRadius: "4px", textTransform: "uppercase" }}>Author</span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.7rem", color: mutedText, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{comment.authorHeadline}</p>
                </div>
                <span style={{ fontSize: "0.7rem", color: mutedText, flexShrink: 0 }}>{comment.timeAgo}</span>
              </div>
              <div style={{ fontSize: "0.85rem", color: textColor, marginTop: "6px", lineHeight: "1.5", wordBreak: "break-word" }}>
                {comment.content}
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "12px", marginTop: "4px", marginLeft: "8px", fontSize: "0.75rem", fontWeight: 600 }}>
              <button onClick={() => handleCommentLike(comment.id)} style={{ background: "none", border: "none", cursor: "pointer", color: comment.isLikedByMe ? accentColor : mutedText, padding: 0 }}>
                Like {comment.likes > 0 && `(${comment.likes})`}
              </button>
              <span style={{ color: borderColor }}>|</span>
              <button onClick={() => { setReplyingTo(replyingTo === comment.id ? null : comment.id); setReplyText(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: mutedText, padding: 0 }}>Reply</button>
            </div>

            {replyingTo === comment.id && (
              <div style={{ display: "flex", gap: "8px", marginTop: "12px", alignItems: "center" }}>
                <input 
                  autoFocus placeholder="Write a reply..." value={replyText} 
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter') handleAddReply(comment.id); }}
                  style={{ flex: 1, backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor, padding: "8px 16px", borderRadius: "20px", outline: "none", fontSize: "0.8rem" }}
                />
                <button onClick={() => handleAddReply(comment.id)} disabled={!replyText.trim() || isSubmitting} style={{ background: "none", border: "none", color: accentColor, cursor: "pointer", opacity: replyText.trim() ? 1 : 0.5 }}>
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            )}
            
            {comment.replies && comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${borderColor}` }}>
      {/* Main Comment Input */}
      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: isDark ? "#334155" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <User size={18} color={mutedText} />
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", backgroundColor: inputBg, borderRadius: "24px", padding: "4px 12px", border: `1px solid ${borderColor}` }}>
          <input 
            type="text" placeholder="Add a comment..." value={commentText} 
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter') handleAddComment(); }} 
            style={{ flex: 1, background: "transparent", border: "none", color: textColor, padding: "8px", outline: "none", fontSize: "0.85rem" }} 
          />
          <button onClick={handleAddComment} disabled={!commentText.trim() || isSubmitting} style={{ background: "none", border: "none", color: accentColor, cursor: "pointer", display: "flex", alignItems: "center", padding: "4px", opacity: commentText.trim() ? 1 : 0.5 }}>
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>

      <div style={{ marginTop: "8px" }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
            <Loader2 size={24} className="animate-spin" color={accentColor} />
          </div>
        ) : (
          comments.map(comment => renderComment(comment, 0))
        )}
      </div>
    </div>
  );
};

export default CommentSection;