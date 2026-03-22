import React from "react";
import { User, Bookmark, Settings } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ProfileSidebar: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Dynamic colors based on theme
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = "#6366f1"; // Indigo Brand Color

  const cardStyle: React.CSSProperties = {
    backgroundColor: cardBg,
    borderRadius: "12px",
    border: `1px solid ${borderColor}`,
    overflow: "hidden",
    color: textColor,
    boxShadow: isDark ? "0 4px 6px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
  };

  const statRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85rem",
    color: mutedText,
    cursor: "pointer",
  };

  const statValueStyle: React.CSSProperties = {
    color: accentColor,
    fontWeight: "600",
  };

  return (
    <div style={cardStyle}>
      {/* Cover Photo Area - Gradient Brand Style */}
      <div style={{ height: "70px", background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" }} />
      
      <div style={{ padding: "0 1rem 1rem 1rem", textAlign: "center", marginTop: "-30px" }}>
        {/* Profile Avatar Container */}
        <div style={{ 
          width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 10px auto",
          backgroundColor: isDark ? "#334155" : "#e2e8f0", 
          border: `3px solid ${cardBg}`, display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden"
        }}>
          {/* Default User Icon */}
          <User size={32} color={mutedText} />
        </div>
        
        {/* User Name and Tagline */}
        <h2 style={{ fontSize: "1.1rem", fontWeight: "600", margin: "0 0 4px 0", fontFamily: "Inter, sans-serif" }}>
          Afzal
        </h2>
        <p style={{ fontSize: "0.85rem", color: mutedText, margin: "0 0 16px 0", lineHeight: "1.4" }}>
          BCA Final Year | Aspiring AI Engineer & FAANG SDE | C++ & MERN Stack
        </p>
        
        {/* Stats Section */}
        <div style={{ 
          borderTop: `1px solid ${borderColor}`, paddingTop: "12px", 
          borderBottom: `1px solid ${borderColor}`, paddingBottom: "12px", 
          textAlign: "left", display: "flex", flexDirection: "column", gap: "8px"
        }}>
          <div style={statRowStyle} onMouseOver={(e) => e.currentTarget.style.color = textColor} onMouseOut={(e) => e.currentTarget.style.color = mutedText}>
            <span>My Connections</span>
            <span style={statValueStyle}>42</span>
          </div>
          <div style={statRowStyle} onMouseOver={(e) => e.currentTarget.style.color = textColor} onMouseOut={(e) => e.currentTarget.style.color = mutedText}>
            <span>My Posts</span>
            <span style={statValueStyle}>19</span>
          </div>
        </div>

        {/* Quick Links Section */}
        <div style={{ paddingTop: "12px", display: "flex", flexDirection: "column", gap: "10px", textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer", color: mutedText }} onMouseOver={(e) => e.currentTarget.style.color = textColor} onMouseOut={(e) => e.currentTarget.style.color = mutedText}>
            <Bookmark size={16} />
            <span>Saved items</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer", color: mutedText }} onMouseOver={(e) => e.currentTarget.style.color = textColor} onMouseOut={(e) => e.currentTarget.style.color = mutedText}>
            <Settings size={16} />
            <span>Profile Settings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;