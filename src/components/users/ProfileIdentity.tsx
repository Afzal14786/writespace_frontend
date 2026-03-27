import React from "react";
import { MapPin, Calendar, Edit3, Github, Twitter, Linkedin, Instagram, Globe, Mail, Plus, Youtube, Facebook, Code2, Terminal, BookOpen } from "lucide-react";
import type { User } from "../../types/api.types";
import { useTheme } from "../../context/ThemeContext";

interface ProfileIdentityProps {
  profileUser: User;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onToggleFollow: (e: React.MouseEvent) => void;
  onOpenEditModal: () => void;
}

const ProfileIdentity: React.FC<ProfileIdentityProps> = ({ profileUser, isOwnProfile, isFollowing, onToggleFollow, onOpenEditModal }) => {
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#f8fafc" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = "#6366f1";

  const socials = [
    { name: "Website", url: profileUser.website, icon: Globe, color: isDark ? "#818cf8" : "#4f46e5" },
    { name: "GitHub", url: profileUser.github, icon: Github, color: isDark ? "#ffffff" : "#181717" },
    { name: "Twitter", url: profileUser.twitter, icon: Twitter, color: "#1DA1F2" },
    { name: "LinkedIn", url: profileUser.linkedin, icon: Linkedin, color: "#0A66C2" },
    { name: "Instagram", url: profileUser.instagram, icon: Instagram, color: "#E1306C" },
    { name: "YouTube", url: profileUser.youtube, icon: Youtube, color: "#FF0000" },
    { name: "Facebook", url: profileUser.facebook, icon: Facebook, color: "#1877F2" },
    { name: "LeetCode", url: profileUser.leetcode, icon: Code2, color: "#FFA116" },
    { name: "Codeforces", url: profileUser.codeforces, icon: Terminal, color: "#1F8ACB" },
    { name: "GeeksforGeeks", url: profileUser.geeksforgeeks, icon: BookOpen, color: "#2F8D46" },
  ].filter(s => s.url && s.url.trim() !== "");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      
      {/* MAIN IDENTITY CARD */}
      <div style={{ backgroundColor: cardBg, borderRadius: "16px", border: `1px solid ${borderColor}`, overflow: "hidden", boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.2)" : "0 4px 12px rgba(0,0,0,0.05)" }}>
        
        {/* Banner */}
        <div style={{ height: "120px", backgroundColor: isDark ? "#334155" : "#e2e8f0", backgroundImage: `url(${profileUser.bannerImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        
        <div style={{ padding: "0 20px 20px 20px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "-45px", marginBottom: "16px" }}>
            <div style={{ width: "90px", height: "90px", borderRadius: "50%", border: `4px solid ${cardBg}`, backgroundColor: "#cbd5e1", overflow: "hidden", flexShrink: 0 }}>
              <img src={profileUser.profileImageUrl || `https://ui-avatars.com/api/?name=${profileUser.username}`} alt={profileUser.fullname} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            
            <div>
              {isOwnProfile ? (
                <button 
                  onClick={onOpenEditModal} 
                  style={{ padding: "6px 14px", borderRadius: "20px", backgroundColor: "transparent", border: `1px solid ${borderColor}`, color: textColor, fontWeight: 600, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", transition: "background 0.2s" }} 
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <Edit3 size={14} /> Edit Profile
                </button>
              ) : (
                <button 
                  onClick={onToggleFollow} 
                  style={{ padding: "6px 16px", borderRadius: "20px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px", backgroundColor: isFollowing ? "transparent" : accentColor, border: isFollowing ? `1px solid ${borderColor}` : "none", color: isFollowing ? textColor : "#ffffff" }}
                >
                  {isFollowing ? "Following" : <><Plus size={14} /> Follow</>}
                </button>
              )}
            </div>
          </div>

          <h1 style={{ margin: "0 0 2px 0", fontSize: "1.3rem", fontWeight: 800, color: textColor }}>{profileUser.fullname}</h1>
          <span style={{ fontSize: "0.9rem", color: mutedText }}>@{profileUser.username}</span>
          
          {profileUser.headline && (
            <p style={{ margin: "12px 0 0 0", fontSize: "0.95rem", color: textColor, lineHeight: "1.5" }}>{profileUser.headline}</p>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "16px", fontSize: "0.85rem", color: mutedText }}>
            {profileUser.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={16} /> {profileUser.location}</div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Calendar size={16} /> Joined {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "Recently"}
            </div>
          </div>
        </div>
      </div>

      {/* ABOUT SECTION */}
      {profileUser.bio && (
        <div style={{ backgroundColor: cardBg, borderRadius: "16px", border: `1px solid ${borderColor}`, padding: "20px" }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: 700, color: textColor }}>About</h3>
          <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: "1.6", color: textColor, whiteSpace: "pre-wrap" }}>{profileUser.bio}</p>
        </div>
      )}

      {/* CONNECT (Social Links) */}
      {(socials.length > 0 || profileUser.email) && (
        <div style={{ backgroundColor: cardBg, borderRadius: "16px", border: `1px solid ${borderColor}`, padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "0.95rem", fontWeight: 700, color: textColor }}>Connect</h3>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            
            {socials.map((social) => {
              const safeUrl = social.url && /^https?:\/\//i.test(social.url) ? social.url : `https://${social.url}`;
              
              return (
                <a 
                  key={social.name} 
                  href={safeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ padding: "12px", borderRadius: "12px", backgroundColor: isDark ? "#0f172a" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }} 
                  title={social.name}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? "#334155" : "#e2e8f0"} 
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = isDark ? "#0f172a" : "#f1f5f9"}
                >
                  {/* 🔥 FIX: The icon now renders with its true brand color */}
                  <social.icon size={20} color={social.color} />
                </a>
              );
            })}

            {profileUser.email && (
              <a 
                href={`mailto:${profileUser.email}`} 
                style={{ padding: "12px", borderRadius: "12px", backgroundColor: isDark ? "#0f172a" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }} 
                title="Email"
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? "#334155" : "#e2e8f0"} 
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = isDark ? "#0f172a" : "#f1f5f9"}
              >
                {/* Official Google Red for Mail */}
                <Mail size={20} color="#EA4335" />
              </a>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default ProfileIdentity;