import React from "react";
import { TrendingUp, Hash, MessageSquare } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const TrendingSidebar: React.FC = () => {
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
    color: textColor,
    boxShadow: isDark ? "0 4px 6px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
    padding: "1rem",
  };

  const trendingItemStyle: React.CSSProperties = {
    display: "flex", 
    flexDirection: "column", 
    gap: "2px", 
    cursor: "pointer",
    transition: "transform 0.2s ease"
  };

  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={cardStyle}>
        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
          <TrendingUp size={18} color={accentColor} />
          <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: 0, fontFamily: "Inter, sans-serif" }}>
            Trending Topicspace
          </h3>
        </div>

        {/* Trending Items List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { tag: "MERN_Stack_2026", posts: "1.2K Discussions" },
            { tag: "System_Design_Fundamentals", posts: "830 Responses" },
            { tag: "AI_Engineering_Roadmap", posts: "2.4K Discussions" },
            { tag: "Writespace_Developer_Log", posts: "112 Responses" },
            { tag: "Competitive_Programming_Hub", posts: "612 Discussions" }
          ].map((item, idx) => (
            <div key={idx} style={trendingItemStyle} onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", fontSize: "0.9rem", color: textColor }}>
                <Hash size={14} color={mutedText} /> {item.tag}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: mutedText, marginLeft: "20px" }}>
                <MessageSquare size={12} />
                <span>{item.posts}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded Footer Links (Desktop Only) */}
      <div style={{ textAlign: "center", fontSize: "0.75rem", color: mutedText, padding: "0 1rem", lineHeight: "1.6" }}>
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "x 10px", margin: "0 0 10px 0" }}>
          <li style={{ cursor: "pointer" }}>About</li>
          <li style={{ cursor: "pointer" }}>Help Center</li>
          <li style={{ cursor: "pointer" }}>Privacy Policy</li>
          <li style={{ cursor: "pointer" }}>Terms</li>
          <li style={{ cursor: "pointer" }}>Community Guidelines</li>
        </ul>
        <p>Writespace Corporation © 2026</p>
      </div>
    </aside>
  );
};

export default TrendingSidebar;