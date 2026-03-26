import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Calendar, Edit3, UserPlus, MessageSquare, FileText, Code, X, Loader2, User as UserIcon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

import PostComponent from "../home/PostComponent";
import type { User, Post } from "../../types/api.types";
import { UsersAPI, type UpdateProfilePayload } from "../../api/users.api";
import { PostsAPI, type PaginatedPosts } from "../../api/posts.api";

type TabType = "ALL" | "CODE" | "MEDIA";

interface ApiErrorResponse {
  response?: { data?: { message?: string; }; };
}

// 🔥 Helper interface to satisfy PostComponent props safely
interface ExtendedAuthor {
  id: string;
  username: string;
  fullname?: string;
  profileImageUrl?: string | null;
  headline?: string;
}

interface ExtendedPost extends Omit<Post, 'author'> {
  author: ExtendedAuthor;
  isLiked?: boolean;
}

const Profile: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const { user: authUser, loginState } = useAuth();

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowWidth < 768;

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  const [editForm, setEditForm] = useState({
    fullname: "", headline: "", bio: "", location: "",
  });
  
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  // Pagination State
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);

  // Intersection Observer Setup
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && cursor !== null) {
          setIsFetchingMore(true); 
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingMore, hasMore, cursor]
  );

  // Fetch User Data & Initial Posts
  useEffect(() => {
    let isMounted = true;

    const fetchProfileData = async () => {
      const targetUsername = username || authUser?.username;
      
      if (!targetUsername) {
        navigate("/home");
        return;
      }

      try {
        if (!cursor) setIsLoading(true);

        if (!profileUser && !cursor) {
          const profileData = await UsersAPI.getProfileByUsername(targetUsername);
          if (isMounted) {
            setProfileUser(profileData);
            setEditForm({
              fullname: profileData.fullname || "",
              headline: profileData.headline || "",
              bio: profileData.bio || "",
              location: profileData.location || "",
            });
          }
        }

        const currentProfileId = profileUser?.id || (await UsersAPI.getProfileByUsername(targetUsername)).id;

        const feedResponse = (await PostsAPI.getPosts(cursor || undefined, 20, currentProfileId)) as PaginatedPosts;

        if (isMounted) {
          const newPosts = feedResponse.posts || [];
          const nextCursor = feedResponse.pagination?.nextCursor || null;

          setHasMore(nextCursor !== null);

          if (!cursor) {
            setUserPosts(newPosts);
          } else {
            setUserPosts((prevPosts) => {
              const existingIds = new Set(prevPosts.map(p => p.id));
              const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
              return [...prevPosts, ...uniqueNewPosts];
            });
          }
          
          if (nextCursor !== cursor) {
             setCursor(nextCursor);
          }
        }
      } catch (error: unknown) {
        console.error("Profile Fetch Error:", error);
        if (isMounted) {
          const err = error as ApiErrorResponse;
          toast.error(err.response?.data?.message || "Failed to load profile data.");
          navigate("/home");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsFetchingMore(false);
        }
      }
    };

    if (!cursor || isFetchingMore) {
      fetchProfileData();
    }

    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, authUser, navigate, isFetchingMore]);

  const isOwnProfile = authUser?.username === profileUser?.username;

  const handleSaveProfile = async () => {
    if (!profileUser) return;
    setIsSaving(true);

    const payload: UpdateProfilePayload = {
      personal_info: {
        fullname: editForm.fullname,
        headline: editForm.headline,
        bio: editForm.bio,
        location: editForm.location,
      },
      profileImage: profileFile || undefined,
      bannerImage: bannerFile || undefined,
    };

    try {
      const updatedUser = await UsersAPI.updateProfile(profileUser.id, payload);
      setProfileUser(updatedUser);

      const token = localStorage.getItem("accessToken");
      
      if (token) loginState(updatedUser, token);

      setIsEditModalOpen(false);
      toast.success("Profile updated successfully!");
    } catch (error: unknown) {
      console.error(error);
      const err = error as ApiErrorResponse;
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const displayedPosts = userPosts.filter((post) => {
    if (activeTab === "CODE") return post.codeSnippets && post.codeSnippets.length > 0;
    if (activeTab === "MEDIA") return post.media && post.media.length > 0;
    return true;
  });

  const bgCard = isDark ? "#1e293b" : "#ffffff";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const accentColor = "#6366f1";

  if (isLoading && !isFetchingMore) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Loader2 size={40} className="animate-spin" color={accentColor} />
      </div>
    );
  }

  if (!profileUser) return null;

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", paddingTop: "80px", paddingLeft: isMobile ? "0.5rem" : "1rem", paddingRight: isMobile ? "0.5rem" : "1rem", paddingBottom: "3rem" }}>
      <div style={{ backgroundColor: bgCard, borderRadius: "16px", border: `1px solid ${borderColor}`, overflow: "hidden", marginBottom: "1.5rem", boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.2)" : "0 4px 20px rgba(0,0,0,0.05)" }}>
        
        {/* Banner Section */}
        <div style={{ height: isMobile ? "140px" : "200px", background: bannerFile ? `url(${URL.createObjectURL(bannerFile)}) center/cover` : profileUser.bannerImageUrl ? `url(${profileUser.bannerImageUrl}) center/cover` : "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", position: "relative" }}>
          {isOwnProfile && (
            <>
              <input type="file" id="bannerUpload" accept="image/*" style={{ display: "none" }} onChange={(e) => { if (e.target.files && e.target.files[0]) setBannerFile(e.target.files[0]); }} />
              <label htmlFor="bannerUpload" style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "0.8rem", backdropFilter: "blur(4px)" }}>
                Change Cover
              </label>
            </>
          )}
        </div>

        {/* Profile Info Section */}
        <div style={{ padding: isMobile ? "0 1rem 1.5rem 1rem" : "0 2rem 2rem 2rem", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: isMobile ? "-45px" : "-65px", marginBottom: "16px" }}>
            
            {/* Avatar */}
            <div style={{ position: "relative", width: isMobile ? "100px" : "140px", height: isMobile ? "100px" : "140px", borderRadius: "50%", border: `4px solid ${bgCard}`, backgroundColor: isDark ? "#334155" : "#e2e8f0", overflow: "hidden", zIndex: 10 }}>
              {profileFile ? (
                <img src={URL.createObjectURL(profileFile)} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : profileUser.profileImageUrl ? (
                <img src={profileUser.profileImageUrl} alt={profileUser.fullname} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <UserIcon size={60} color={mutedText} style={{ margin: "auto", marginTop: isMobile ? "16px" : "36px" }} />
              )}
              {isOwnProfile && (
                <>
                  <input type="file" id="profileUpload" accept="image/*" style={{ display: "none" }} onChange={(e) => { if (e.target.files && e.target.files[0]) setProfileFile(e.target.files[0]); }} />
                  <label htmlFor="profileUpload" style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", color: "white", fontSize: "0.7rem", textAlign: "center", padding: "4px 0", cursor: "pointer", backdropFilter: "blur(2px)" }}>
                    Update
                  </label>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px", zIndex: 10 }}>
              {isOwnProfile ? (
                <button onClick={() => setIsEditModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "transparent", border: `1px solid ${borderColor}`, color: textColor, padding: isMobile ? "6px 12px" : "8px 20px", borderRadius: "24px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", transition: "background 0.2s" }}>
                  <Edit3 size={16} /> {!isMobile && "Edit Profile"}
                </button>
              ) : (
                <>
                  <button onClick={() => setIsFollowing(!isFollowing)} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: isFollowing ? "transparent" : accentColor, border: isFollowing ? `1px solid ${borderColor}` : "none", color: isFollowing ? textColor : "white", padding: isMobile ? "6px 16px" : "8px 24px", borderRadius: "24px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
                    <UserPlus size={16} /> {isFollowing ? "Following" : "Follow"}
                  </button>
                  <button style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "transparent", border: `1px solid ${accentColor}`, color: accentColor, padding: isMobile ? "6px 16px" : "8px 24px", borderRadius: "24px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
                    <MessageSquare size={16} /> {!isMobile && "Message"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Text Info */}
          <div>
            <h1 style={{ fontSize: isMobile ? "1.4rem" : "1.8rem", fontWeight: 800, color: textColor, margin: "0 0 4px 0", letterSpacing: "-0.5px" }}>{profileUser.fullname}</h1>
            <p style={{ fontSize: isMobile ? "0.9rem" : "1rem", color: textColor, margin: "0 0 12px 0", fontWeight: 500 }}>{profileUser.headline || "Software Engineer"}</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? "12px" : "20px", fontSize: "0.85rem", color: mutedText, marginBottom: "16px", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={14} /> {profileUser.location || "Dubai"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Calendar size={14} /> Joined {profileUser.createdAt ? new Date(profileUser.createdAt).getFullYear() : "2026"}
              </span>
            </div>

            <div style={{ fontSize: "0.95rem", color: textColor, lineHeight: "1.6", backgroundColor: isDark ? "rgba(0,0,0,0.15)" : "#f8fafc", padding: "16px", borderRadius: "8px", border: `1px solid ${borderColor}` }}>
              <p style={{ margin: 0 }}>{profileUser.bio || (isOwnProfile ? "Click 'Edit Profile' to add a bio." : "This user hasn't added a bio yet.")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${borderColor}`, marginBottom: "20px", overflowX: "auto", scrollbarWidth: "none" }}>
        <button onClick={() => setActiveTab("ALL")} style={{ flex: isMobile ? "none" : 1, minWidth: isMobile ? "120px" : "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px 0", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", color: activeTab === "ALL" ? accentColor : mutedText, borderBottom: activeTab === "ALL" ? `3px solid ${accentColor}` : "3px solid transparent", transition: "all 0.2s ease" }}>
          <FileText size={18} /> All Posts
        </button>
        <button onClick={() => setActiveTab("CODE")} style={{ flex: isMobile ? "none" : 1, minWidth: isMobile ? "140px" : "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px 0", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", color: activeTab === "CODE" ? accentColor : mutedText, borderBottom: activeTab === "CODE" ? `3px solid ${accentColor}` : "3px solid transparent", transition: "all 0.2s ease" }}>
          <Code size={18} /> Code Snippets
        </button>
      </div>

      {/* Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {displayedPosts.length > 0 ? (
          <>
            {/* 🔥 TYPE SAFE CAST: Explicitly cast through unknown to satisfy TS without any */}
            {displayedPosts.map((post) => <PostComponent key={post.id} post={post as unknown as ExtendedPost} />)}
            
            {/* Background loader while fetching next cursor payload */}
            {isFetchingMore && (
              <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
                <Loader2 size={24} className="animate-spin" color={accentColor} />
              </div>
            )}

            {/* The Invisible Trigger Div for Intersection Observer */}
            {!isFetchingMore && hasMore && (
              <div ref={lastPostElementRef} style={{ height: "20px" }} />
            )}

            {/* End of feed message */}
            {!hasMore && displayedPosts.length > 5 && (
              <div style={{ textAlign: "center", color: mutedText, padding: "2rem", fontSize: "0.9rem" }}>
                You've reached the end of {profileUser.fullname}'s posts.
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: bgCard, borderRadius: "12px", border: `1px solid ${borderColor}` }}>
            <div style={{ width: "64px", height: "64px", backgroundColor: isDark ? "#334155" : "#e2e8f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
              {activeTab === "CODE" ? <Code size={32} color={mutedText} /> : <FileText size={32} color={mutedText} />}
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: textColor, margin: "0 0 8px 0" }}>No posts yet</h3>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)", animation: "fadeIn 0.2s" }}>
          <div style={{ width: "100%", maxWidth: "550px", backgroundColor: bgCard, borderRadius: "16px", border: `1px solid ${borderColor}`, boxShadow: "0 20px 40px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${borderColor}` }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: textColor }}>Edit Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: "none", border: "none", color: mutedText, cursor: "pointer" }}><X size={24} /></button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: textColor, marginBottom: "6px" }}>Full Name</label>
                <input type="text" value={editForm.fullname} onChange={(e) => setEditForm({ ...editForm, fullname: e.target.value })} style={{ width: "100%", padding: "10px", backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "#f8fafc", border: `1px solid ${borderColor}`, borderRadius: "8px", color: textColor, outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: textColor, marginBottom: "6px" }}>Headline</label>
                <input type="text" value={editForm.headline} onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })} placeholder="Software Engineer @ Google" style={{ width: "100%", padding: "10px", backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "#f8fafc", border: `1px solid ${borderColor}`, borderRadius: "8px", color: textColor, outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: textColor, marginBottom: "6px" }}>Location</label>
                <input type="text" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} placeholder="e.g. Dubai" style={{ width: "100%", padding: "10px", backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "#f8fafc", border: `1px solid ${borderColor}`, borderRadius: "8px", color: textColor, outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: textColor, marginBottom: "6px" }}>Bio</label>
                <textarea rows={4} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Tell us about yourself..." style={{ width: "100%", padding: "10px", backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "#f8fafc", border: `1px solid ${borderColor}`, borderRadius: "8px", color: textColor, outline: "none", resize: "none" }} />
              </div>
            </div>

            <div style={{ padding: "16px 20px", borderTop: `1px solid ${borderColor}`, display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button onClick={() => setIsEditModalOpen(false)} disabled={isSaving} style={{ padding: "8px 16px", background: "none", border: "none", color: textColor, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSaveProfile} disabled={isSaving} style={{ padding: "8px 24px", backgroundColor: accentColor, border: "none", color: "white", fontWeight: 600, borderRadius: "24px", cursor: isSaving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : null} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;