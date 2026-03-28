import React, { useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, Calendar, Edit3, Globe, Mail, Plus, X } from "lucide-react";
import { FaGithub, FaTwitter, FaLinkedin, FaInstagram, FaYoutube, FaFacebook } from "react-icons/fa";
import { SiLeetcode, SiCodeforces, SiGeeksforgeeks } from "react-icons/si";

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
  
  const [isBioModalOpen, setIsBioModalOpen] = useState<boolean>(false);

  const isDark = theme === "dark";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#f8fafc" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = "#6366f1";

  const socials = [
    { name: "Website", url: profileUser.website, icon: Globe, color: isDark ? "#818cf8" : "#4f46e5" },
    { name: "GitHub", url: profileUser.github, icon: FaGithub, color: isDark ? "#ffffff" : "#181717" },
    { name: "Twitter", url: profileUser.twitter, icon: FaTwitter, color: "#1DA1F2" },
    { name: "LinkedIn", url: profileUser.linkedin, icon: FaLinkedin, color: "#0A66C2" },
    { name: "Instagram", url: profileUser.instagram, icon: FaInstagram, color: "#E1306C" },
    { name: "YouTube", url: profileUser.youtube, icon: FaYoutube, color: "#FF0000" },
    { name: "Facebook", url: profileUser.facebook, icon: FaFacebook, color: "#1877F2" },
    { name: "LeetCode", url: profileUser.leetcode, icon: SiLeetcode, color: "#FFA116" },
    { name: "Codeforces", url: profileUser.codeforces, icon: SiCodeforces, color: "#1F8ACB" },
    { name: "GeeksforGeeks", url: profileUser.geeksforgeeks, icon: SiGeeksforgeeks, color: "#2F8D46" },
  ].filter(s => s.url && s.url.trim() !== "");

  const MAX_BIO_LENGTH = 180;
  const bioText = profileUser.bio || "";
  const isBioLong = bioText.length > MAX_BIO_LENGTH;
  const shortBio = isBioLong ? bioText.slice(0, MAX_BIO_LENGTH) : bioText;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* MAIN IDENTITY CARD */}
        <div style={{ backgroundColor: cardBg, borderRadius: "16px", border: `1px solid ${borderColor}`, overflow: "hidden", boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.2)" : "0 4px 12px rgba(0,0,0,0.05)" }}>
          
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

        {/* ABOUT SECTION (Truncated) */}
        {profileUser.bio && (
          <div style={{ backgroundColor: cardBg, borderRadius: "16px", border: `1px solid ${borderColor}`, padding: "20px" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: 700, color: textColor }}>About</h3>
            <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: "1.6", color: textColor, whiteSpace: "pre-wrap" }}>
              {isBioLong ? shortBio : bioText}
              {isBioLong && (
                <span 
                  onClick={() => setIsBioModalOpen(true)}
                  style={{ color: accentColor, fontWeight: 600, cursor: "pointer", marginLeft: "4px" }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}
                >
                  ...more
                </span>
              )}
            </p>
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
                    style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: isDark ? "#0f172a" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }} 
                    title={social.name}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? "#334155" : "#e2e8f0"} 
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = isDark ? "#0f172a" : "#f1f5f9"}
                  >
                    <social.icon size={20} color={social.color} />
                  </a>
                );
              })}

              {profileUser.email && (
                <a 
                  href={`mailto:${profileUser.email}`} 
                  style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: isDark ? "#0f172a" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }} 
                  title="Email"
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? "#334155" : "#e2e8f0"} 
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = isDark ? "#0f172a" : "#f1f5f9"}
                >
                  <Mail size={20} color="#EA4335" />
                </a>
              )}

            </div>
          </div>
        )}
      </div>

      {isBioModalOpen && createPortal(
        <div 
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100, padding: "20px" }}
          onClick={() => setIsBioModalOpen(false)}
        >
          <div 
            style={{ backgroundColor: cardBg, borderRadius: "16px", width: "100%", maxWidth: "600px", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", border: `1px solid ${borderColor}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${borderColor}` }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem", color: textColor, fontWeight: 700 }}>About {profileUser.fullname}</h2>
              <button onClick={() => setIsBioModalOpen(false)} style={{ background: "transparent", border: "none", color: mutedText, cursor: "pointer", display: "flex", padding: "4px" }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: "24px", overflowY: "auto", fontSize: "0.95rem", lineHeight: "1.7", color: textColor, whiteSpace: "pre-wrap" }}>
              {bioText}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ProfileIdentity;