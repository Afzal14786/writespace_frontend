import React, { useState, useEffect, useCallback } from "react";
import { User, Send, Loader2, Heart } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import type { CommentData } from "../../types/api.types";
import { InteractionsAPI } from "../../api/interactions.api";

interface CommentSectionProps {
  postId: string;
  postAuthorUsername: string; // Used to identify the author badge
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, postAuthorUsername }) => {
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const isDark = theme === "dark";

  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [commentText, setCommentText] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowWidth < 480;

  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = isDark ? "#818cf8" : "#4f46e5";
  const inputBg = isDark ? "rgba(0,0,0,0.3)" : "#f3f4f6";
  const authorBadgeBg = isDark ? "#334155" : "#e2e8f0";

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await InteractionsAPI.getComments(postId); 
      setComments(response || []);
    } catch (error: unknown) {
      console.error("Failed to fetch comments", error);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async () => {
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await InteractionsAPI.addComment(postId, commentText);
      setComments([response, ...comments]);
      setCommentText("");
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!replyText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await InteractionsAPI.addComment(postId, replyText, parentId);
      
      const addReplyToTree = (list: CommentData[]): CommentData[] => {
        return list.map(c => {
          if (c.id === parentId) return { ...c, replies: [response, ...(c.replies || [])] };
          if (c.replies) return { ...c, replies: addReplyToTree(c.replies) };
          return c;
        });
      };

      setComments(addReplyToTree(comments));
      setReplyText("");
      setReplyingTo(null);
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    try {
      await InteractionsAPI.deleteComment(commentId);
      toast.success("Comment deleted");

      const removeCommentFromTree = (list: CommentData[]): CommentData[] => {
        return list
          .filter(c => c.id !== commentId)
          .map(c => ({ ...c, replies: c.replies ? removeCommentFromTree(c.replies) : [] }));
      };
      
      setComments(prev => removeCommentFromTree(prev));
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete comment");
    }
  };

  const handleCommentLike = async (commentId: string) => {
    setComments(prev => {
      const toggleLikeInTree = (list: CommentData[]): CommentData[] => {
        return list.map(c => {
          if (c.id === commentId) {
            const isLiked = c.isLikedByMe;
            return { ...c, likes: isLiked ? c.likes - 1 : c.likes + 1, isLikedByMe: !isLiked };
          }
          if (c.replies) return { ...c, replies: toggleLikeInTree(c.replies) };
          return c;
        });
      };
      return toggleLikeInTree(prev);
    });
      
    try {
      await InteractionsAPI.toggleLike(commentId); 
    } catch (error: unknown) {
      console.error(error);
      toast.error("Action failed");
      setComments(prev => {
        const toggleLikeInTree = (list: CommentData[]): CommentData[] => {
          return list.map(c => {
            if (c.id === commentId) {
              const isLiked = c.isLikedByMe;
              return { ...c, likes: isLiked ? c.likes - 1 : c.likes + 1, isLikedByMe: !isLiked };
            }
            if (c.replies) return { ...c, replies: toggleLikeInTree(c.replies) };
            return c;
          });
        };
        return toggleLikeInTree(prev);
      });
    }
  };

  const renderComment = (comment: CommentData, depth: number = 0, isLastChild: boolean = false) => {
    const maxDepth = isMobile ? 1 : 2;
    const isIndented = depth > 0;
    const indentSize = isIndented ? (isMobile ? 32 : 44) : 0;
    
    // 🔥 Checks Ownership to append Author badge or allow deletion
    const isAuthor = comment.authorName === postAuthorUsername;
    const isCommentOwner = authUser?.username === comment.authorName; 

    return (
      <div key={comment.id} style={{ marginTop: depth === 0 ? "16px" : "12px", marginLeft: `${Math.min(depth, maxDepth) * indentSize}px`, position: "relative" }}>
        
        {isIndented && (
          <div style={{ position: "absolute", left: `${-indentSize + 16}px`, top: "-12px", bottom: isLastChild ? "calc(100% - 24px)" : "-10px", width: "2px", backgroundColor: borderColor }}>
            <div style={{ position: "absolute", top: "24px", left: "2px", width: `${indentSize - 18}px`, height: "2px", backgroundColor: borderColor, borderBottomLeftRadius: "8px" }} />
          </div>
        )}
        
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ width: depth === 0 ? "32px" : "26px", height: depth === 0 ? "32px" : "26px", borderRadius: "50%", backgroundColor: isDark ? "#334155" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", zIndex: 2 }}>
            {/* 🔥 Commenter's avatar logic can be inserted here if backend returns it */}
            <User size={depth === 0 ? 16 : 14} color={mutedText} />
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ backgroundColor: inputBg, padding: "10px 14px", borderRadius: "0 12px 12px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.85rem", color: textColor }}>{comment.authorName}</span>
                    {isAuthor && <span style={{ backgroundColor: authorBadgeBg, color: textColor, fontSize: "0.6rem", fontWeight: 700, padding: "1px 6px", borderRadius: "4px", textTransform: "uppercase" }}>Author</span>}
                  </div>
                  <p style={{ fontSize: "0.7rem", color: mutedText, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{comment.authorHeadline}</p>
                </div>
                <span style={{ fontSize: "0.7rem", color: mutedText, flexShrink: 0 }}>{comment.timeAgo}</span>
              </div>
              <div style={{ fontSize: "0.85rem", color: textColor, marginTop: "6px", lineHeight: "1.5", wordBreak: "break-word" }}>{comment.content}</div>
            </div>
            
            <div style={{ display: "flex", gap: "12px", marginTop: "4px", marginLeft: "8px", fontSize: "0.75rem", fontWeight: 600 }}>
              <button onClick={() => handleCommentLike(comment.id)} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", color: comment.isLikedByMe ? accentColor : mutedText, padding: 0 }}>
                <Heart size={12} fill={comment.isLikedByMe ? accentColor : "none"} />
                Like {comment.likes > 0 && `(${comment.likes})`}
              </button>

              <span style={{ color: borderColor }}>|</span>
              <button onClick={() => { setReplyingTo(replyingTo === comment.id ? null : comment.id); setReplyText(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: mutedText, padding: 0 }}>
                Reply
              </button>

              {/* 🔥 Delete option restricted to comment owner */}
              {isCommentOwner && (
                <>
                  <span style={{ color: borderColor }}>|</span>
                  <button onClick={() => handleDeleteComment(comment.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 0 }}>
                    Delete
                  </button>
                </>
              )}
            </div>

            {replyingTo === comment.id && (
              <div style={{ display: "flex", gap: "8px", marginTop: "12px", alignItems: "center" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: isDark ? "#334155" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                  {authUser?.profileImageUrl ? <img src={authUser.profileImageUrl} alt="You" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={12} color={mutedText} />}
                </div>
                <input 
                  autoFocus 
                  placeholder="Reply..." 
                  value={replyText} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReplyText(e.target.value)} 
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if(e.key === 'Enter') handleAddReply(comment.id); }} 
                  style={{ flex: 1, minWidth: 0, backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor, padding: "6px 12px", borderRadius: "20px", outline: "none", fontSize: "0.8rem" }} 
                />
                <button onClick={() => handleAddReply(comment.id)} disabled={!replyText.trim() || isSubmitting} style={{ background: "none", border: "none", color: accentColor, cursor: "pointer", opacity: replyText.trim() ? 1 : 0.5 }}>
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            )}
            
            {comment.replies && comment.replies.length > 0 && (
              <div style={{ marginTop: "8px" }}>
                {comment.replies.map((reply, idx) => renderComment(reply, depth + 1, idx === comment.replies!.length - 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${borderColor}` }}>
      <div style={{ display: "flex", gap: "10px" }}>
        
        {/* 🔥 Now instantly renders the current User's profile image on the left! */}
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: isDark ? "#334155" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
          {authUser?.profileImageUrl ? <img src={authUser.profileImageUrl} alt="You" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={18} color={mutedText} />}
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", backgroundColor: inputBg, borderRadius: "24px", padding: "4px 12px", border: `1px solid ${borderColor}` }}>
          <input 
            type="text" 
            placeholder="Add a comment..." 
            value={commentText} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentText(e.target.value)} 
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if(e.key === 'Enter') handleAddComment(); }} 
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
          comments.map((comment, idx) => renderComment(comment, 0, idx === comments.length - 1))
        )}
      </div>
    </div>
  );
};

export default CommentSection;