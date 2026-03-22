import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Notice we import 'User as UserIcon' here to avoid the naming collision!
import { MapPin, Calendar, Link as LinkIcon, Edit3, UserPlus, MessageSquare, FileText, Code, Image as ImageIcon, X, Twitter, Linkedin, Github, Globe, Loader2, User as UserIcon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "react-toastify";

import PostComponent from "../home/PostComponent";
import type { User, Post } from "../../types/api.types";
import { UsersAPI, type UpdateProfilePayload } from "../../api/users.api";
import { PostsAPI } from "../../api/posts.api";

type TabType = "ALL" | "CODE" | "MEDIA";

interface ExtendedUser extends User {
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  totalFollowers?: number;
  totalFollowing?: number;
}

const Profile: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  // --- Responsiveness ---
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowWidth < 768;

  // --- State Management ---
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [profileUser, setProfileUser] = useState<ExtendedUser | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  
  // --- Edit Modal State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    fullname: "", headline: "", bio: "", twitter: "", linkedin: "", github: "", website: ""
  });

  // --- Data Fetching ---
  useEffect(() => {
    let isMounted = true;
    
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Get Logged in User 
        const me = await UsersAPI.getMe() as ExtendedUser;
        if (isMounted) setCurrentUser(me);

        // 2. Determine target profile
        const targetUsername = username || me.username;
        const profileData = await UsersAPI.getProfileByUsername(targetUsername) as ExtendedUser;
        
        if (isMounted) {
          setProfileUser(profileData);
          
          setEditForm({
            fullname: profileData.fullname || "",
            headline: profileData.headline || "",
            bio: profileData.bio || "",
            twitter: profileData.twitter || "", 
            linkedin: profileData.linkedin || "",
            github: profileData.github || "",
            website: profileData.website || ""
          });
        }

        // 3. Fetch Posts associated with this user
        const feed = await PostsAPI.getFeed("recent", 1);
        const filteredPosts = feed.filter((p: Post) => p.author.username === targetUsername);
        if (isMounted) setUserPosts(filteredPosts);

      } catch (error) {
        console.error("Profile Fetch Error:", error);
        if (isMounted) {
          toast.error("Failed to load profile. Ensure you are logged in.");
          navigate("/home");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfileData();
    
    return () => {
      isMounted = false;
    };
  }, [username, navigate]);

  const isOwnProfile = currentUser?.id === profileUser?.id;

  // --- Handlers ---
  const handleSaveProfile = async () => {
    if (!profileUser) return;
    setIsSaving(true);
    
    const payload: UpdateProfilePayload = {
      personal_info: {
        fullname: editForm.fullname,
        headline: editForm.headline,
        bio: editForm.bio,
      },
      social_links: {
        twitter: editForm.twitter,
        linkedin: editForm.linkedin,
        github: editForm.github,
        website: editForm.website,
      }
    };

    try {
      const updatedUser = await UsersAPI.updateProfile(profileUser.id, payload) as ExtendedUser;
      setProfileUser(updatedUser); 
      setIsEditModalOpen(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile. Ensure valid URLs are used.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleHoverEvent = (e: React.MouseEvent<HTMLButtonElement>, isHover: boolean) => {
    const target = e.currentTarget;
    if (isHover) {
      target.style.backgroundColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
    } else {
      target.style.backgroundColor = "transparent";
    }
  };

  // --- Smart Filtering ---
  const displayedPosts = userPosts.filter(post => {
    if (activeTab === "CODE") return post.codeSnippets && post.codeSnippets.length > 0;
    if (activeTab === "MEDIA") return post.media && post.media.length > 0;
    return true; 
  });

  // --- Theme Variables ---
  const bgCard = isDark ? "#1e293b" : "#ffffff";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const accentColor = "#6366f1";

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Loader2 size={40} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!profileUser) return null;

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", paddingTop: "80px", paddingLeft: isMobile ? "0.5rem" : "1rem", paddingRight: isMobile ? "0.5rem" : "1rem", paddingBottom: "3rem" }}>
      
      {/* ================= HERO SECTION ================= */}
      <div style={{ backgroundColor: bgCard, borderRadius: "16px", border: `1px solid ${borderColor}`, overflow: "hidden", marginBottom: "1.5rem", boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.2)" : "0 4px 20px rgba(0,0,0,0.05)" }}>
        
        {/* Banner: Dynamic Image or Gradient Placeholder */}
        <div style={{ 
          height: isMobile ? "140px" : "200px", 
          background: profileUser.bannerImageUrl ? `url(${profileUser.bannerImageUrl}) center/cover` : "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", 
          position: "relative" 
        }}>
          {isOwnProfile && (
            <button style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.4)", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "0.8rem", backdropFilter: "blur(4px)" }}>
              Change Cover
            </button>
          )}
        </div>

        <div style={{ padding: isMobile ? "0 1rem 1.5rem 1rem" : "0 2rem 2rem 2rem", position: "relative" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: isMobile ? "-45px" : "-65px", marginBottom: "16px" }}>
            <div style={{ position: "relative", width: isMobile ? "100px" : "140px", height: isMobile ? "100px" : "140px", borderRadius: "50%", border: `4px solid ${bgCard}`, backgroundColor: isDark ? "#334155" : "#e2e8f0", overflow: "hidden", zIndex: 10 }}>
              {profileUser.profileImageUrl ? (
                <img src={profileUser.profileImageUrl} alt={profileUser.fullname} style={{ width: "100%", height: "100%", objectFit: "cover" }}/> 
              ) : (
                // WE NOW USE <UserIcon /> INSTEAD OF <User />
                <UserIcon size={60} color={mutedText} style={{ margin: "auto", marginTop: isMobile ? "16px" : "36px" }} />
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", zIndex: 10 }}>
              {isOwnProfile ? (
                <button 
                  onClick={() => setIsEditModalOpen(true)} 
                  style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "transparent", border: `1px solid ${borderColor}`, color: textColor, padding: isMobile ? "6px 12px" : "8px 20px", borderRadius: "24px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", transition: "background 0.2s" }}
                  onMouseOver={(e) => handleHoverEvent(e, true)}
                  onMouseOut={(e) => handleHoverEvent(e, false)}
                >
                  <Edit3 size={16} /> {!isMobile && "Edit Profile"}
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setIsFollowing(!isFollowing)}
                    style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: isFollowing ? "transparent" : accentColor, border: isFollowing ? `1px solid ${borderColor}` : "none", color: isFollowing ? textColor : "white", padding: isMobile ? "6px 16px" : "8px 24px", borderRadius: "24px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
                  >
                    <UserPlus size={16} /> {isFollowing ? "Following" : "Follow"}
                  </button>
                  <button style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "transparent", border: `1px solid ${accentColor}`, color: accentColor, padding: isMobile ? "6px 16px" : "8px 24px", borderRadius: "24px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
                    <MessageSquare size={16} /> {!isMobile && "Message"}
                  </button>
                </>
              )}
            </div>
          </div>

          <div>
            <h1 style={{ fontSize: isMobile ? "1.4rem" : "1.8rem", fontWeight: 800, color: textColor, margin: "0 0 4px 0", letterSpacing: "-0.5px" }}>{profileUser.fullname}</h1>
            <p style={{ fontSize: isMobile ? "0.9rem" : "1rem", color: textColor, margin: "0 0 12px 0", fontWeight: 500 }}>{profileUser.headline || "Write a headline to describe yourself."}</p>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? "12px" : "20px", fontSize: "0.85rem", color: mutedText, marginBottom: "16px", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={14}/> Earth</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={14}/> Joined {profileUser.createdAt ? new Date(profileUser.createdAt).getFullYear() : "Writespace"}</span>
              
              <div style={{ display: "flex", gap: "10px", borderLeft: `1px solid ${borderColor}`, paddingLeft: "10px" }}>
                {profileUser.twitter && <a href={profileUser.twitter} target="_blank" rel="noreferrer" style={{ color: mutedText }}><Twitter size={16} /></a>}
                {profileUser.linkedin && <a href={profileUser.linkedin} target="_blank" rel="noreferrer" style={{ color: mutedText }}><Linkedin size={16} /></a>}
                {profileUser.github && <a href={profileUser.github} target="_blank" rel="noreferrer" style={{ color: mutedText }}><Github size={16} /></a>}
                {profileUser.website && <a href={profileUser.website} target="_blank" rel="noreferrer" style={{ color: mutedText }}><Globe size={16} /></a>}
              </div>
            </div>

            <div style={{ fontSize: "0.95rem", color: textColor, lineHeight: "1.6", backgroundColor: isDark ? "rgba(0,0,0,0.15)" : "#f8fafc", padding: "16px", borderRadius: "8px", border: `1px solid ${borderColor}` }}>
              <p style={{ margin: 0 }}>{profileUser.bio || (isOwnProfile ? "Click 'Edit Profile' to add a bio." : "This user hasn't added a bio yet.")}</p>
            </div>

            <div style={{ display: "flex", gap: isMobile ? "16px" : "32px", marginTop: "20px", paddingTop: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 700, color: textColor }}>{profileUser.totalPosts || userPosts.length}</span>
                <span style={{ fontSize: "0.75rem", color: mutedText, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Posts</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 700, color: textColor }}>{profileUser.totalFollowers || 0}</span>
                <span style={{ fontSize: "0.75rem", color: mutedText, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Followers</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 700, color: textColor }}>{profileUser.totalFollowing || 0}</span>
                <span style={{ fontSize: "0.75rem", color: mutedText, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SMART TABS ================= */}
      <div style={{ display: "flex", borderBottom: `1px solid ${borderColor}`, marginBottom: "20px", overflowX: "auto", scrollbarWidth: "none" }}>
        <button onClick={() => setActiveTab("ALL")} style={{ flex: isMobile ? "none" : 1, minWidth: isMobile ? "120px" : "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px 0", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", color: activeTab === "ALL" ? accentColor : mutedText, borderBottom: activeTab === "ALL" ? `3px solid ${accentColor}` : "3px solid transparent", transition: "all 0.2s ease" }}>
          <FileText size={18} /> All Posts
        </button>
        <button onClick={() => setActiveTab("CODE")} style={{ flex: isMobile ? "none" : 1, minWidth: isMobile ? "140px" : "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px 0", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", color: activeTab === "CODE" ? accentColor : mutedText, borderBottom: activeTab === "CODE" ? `3px solid ${accentColor}` : "3px solid transparent", transition: "all 0.2s ease" }}>
          <Code size={18} /> Code Snippets
        </button>
        <button onClick={() => setActiveTab("MEDIA")} style={{ flex: isMobile ? "none" : 1, minWidth: isMobile ? "120px" : "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px 0", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", color: activeTab === "MEDIA" ? accentColor : mutedText, borderBottom: activeTab === "MEDIA" ? `3px solid ${accentColor}` : "3px solid transparent", transition: "all 0.2s ease" }}>
          <ImageIcon size={18} /> Media
        </button>
      </div>

      {/* ================= FEED CONTENT ================= */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {displayedPosts.length > 0 ? (
          displayedPosts.map(post => <PostComponent key={post.id} post={post} />)
        ) : (
          <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: bgCard, borderRadius: "12px", border: `1px solid ${borderColor}` }}>
            <div style={{ width: "64px", height: "64px", backgroundColor: isDark ? "#334155" : "#e2e8f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
               {activeTab === "CODE" ? <Code size={32} color={mutedText} /> : activeTab === "MEDIA" ? <ImageIcon size={32} color={mutedText} /> : <FileText size={32} color={mutedText} />}
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: textColor, margin: "0 0 8px 0" }}>No {activeTab.toLowerCase()} posts yet</h3>
            <p style={{ color: mutedText, fontSize: "0.9rem", margin: 0 }}>
              {isOwnProfile ? "When you create posts with this type of content, they will appear here." : "This user hasn't posted anything in this category yet."}
            </p>
          </div>
        )}
      </div>

      {/* ================= EDIT MODAL ================= */}
      {isEditModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)", animation: "fadeIn 0.2s" }}>
          <div style={{ width: "100%", maxWidth: "550px", backgroundColor: bgCard, borderRadius: "16px", border: `1px solid ${borderColor}`, boxShadow: "0 20px 40px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${borderColor}` }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: textColor }}>Edit Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: "none", border: "none", color: mutedText, cursor: "pointer" }}><X size={24} /></button>
            </div>
            
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
              <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: textColor }}>Personal Information</h3>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: textColor, marginBottom: "6px" }}>Full Name</label>
                <input type="text" value={editForm.fullname} onChange={e => setEditForm({...editForm, fullname: e.target.value})} style={{ width: "100%", padding: "10px", backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "#f8fafc", border: `1px solid ${borderColor}`, borderRadius: "8px", color: textColor, outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: textColor, marginBottom: "6px" }}>Headline</label>
                <input type="text" value={editForm.headline} onChange={e => setEditForm({...editForm, headline: e.target.value})} placeholder="e.g. Senior Software Engineer" style={{ width: "100%", padding: "10px", backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "#f8fafc", border: `1px solid ${borderColor}`, borderRadius: "8px", color: textColor, outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: textColor, marginBottom: "6px" }}>Bio</label>
                <textarea rows={4} value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} placeholder="Tell us about yourself..." style={{ width: "100%", padding: "10px", backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "#f8fafc", border: `1px solid ${borderColor}`, borderRadius: "8px", color: textColor, outline: "none", resize: "none" }} />
              </div>

              <div style={{ borderTop: `1px solid ${borderColor}`, marginTop: "8px", paddingTop: "16px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "0.95rem", fontWeight: 700, color: textColor }}>Social Links</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Twitter size={20} color={mutedText} />
                    <input type="url" placeholder="Twitter URL" value={editForm.twitter} onChange={e => setEditForm({...editForm, twitter: e.target.value})} style={{ flex: 1, padding: "8px 12px", backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "#f8fafc", border: `1px solid ${borderColor}`, borderRadius: "8px", color: textColor, outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Linkedin size={20} color={mutedText} />
                    <input type="url" placeholder="LinkedIn URL" value={editForm.linkedin} onChange={e => setEditForm({...editForm, linkedin: e.target.value})} style={{ flex: 1, padding: "8px 12px", backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "#f8fafc", border: `1px solid ${borderColor}`, borderRadius: "8px", color: textColor, outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Github size={20} color={mutedText} />
                    <input type="url" placeholder="GitHub URL" value={editForm.github} onChange={e => setEditForm({...editForm, github: e.target.value})} style={{ flex: 1, padding: "8px 12px", backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "#f8fafc", border: `1px solid ${borderColor}`, borderRadius: "8px", color: textColor, outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Globe size={20} color={mutedText} />
                    <input type="url" placeholder="Personal Website URL" value={editForm.website} onChange={e => setEditForm({...editForm, website: e.target.value})} style={{ flex: 1, padding: "8px 12px", backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "#f8fafc", border: `1px solid ${borderColor}`, borderRadius: "8px", color: textColor, outline: "none" }} />
                  </div>
                </div>
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