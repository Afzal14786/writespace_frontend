import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Home, MessageSquare, Bell, User, Sun, Moon, Menu, X, ArrowLeft } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const profileImageUrl = ""; 
  const isDark = theme === "dark";

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false); // New state for mobile search

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const textColor = isDark ? "#fff" : "#0f172a";
  const iconColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(15,23,42,0.6)";

  const macGlassStyle: React.CSSProperties = {
    position: "fixed", top: 0, left: 0, right: 0, height: "64px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: isMobile ? "0 1rem" : "0 2rem",
    backgroundColor: isDark ? "rgba(15, 23, 42, 0.65)" : "rgba(255, 255, 255, 0.75)",
    backdropFilter: "saturate(180%) blur(20px)",
    WebkitBackdropFilter: "saturate(180%) blur(20px)",
    borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
    boxShadow: isDark ? "0 4px 30px rgba(0, 0, 0, 0.3)" : "0 4px 30px rgba(0, 0, 0, 0.05)",
    color: textColor,
    zIndex: 1000,
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  };

  const getNavItemStyle = (path: string): React.CSSProperties => {
    const isActive = location.pathname.startsWith(path);
    return {
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textDecoration: "none", gap: "4px", cursor: "pointer", transition: "color 0.2s ease",
      color: isActive ? (isDark ? "#fff" : "#6366f1") : iconColor,
      fontSize: "0.75rem", fontWeight: isActive ? "600" : "500",
    };
  };

  // Render full-width search bar if mobile search is activated
  if (isMobile && isMobileSearchOpen) {
    return (
      <header style={macGlassStyle}>
        <div style={{ display: "flex", alignItems: "center", width: "100%", gap: "12px", animation: "fadeIn 0.2s" }}>
          <button onClick={() => setIsMobileSearchOpen(false)} style={{ background: "none", border: "none", color: iconColor, cursor: "pointer", display: "flex", alignItems: "center" }}>
            <ArrowLeft size={24} />
          </button>
          <input 
            autoFocus 
            type="text" 
            placeholder="Search Writespace..." 
            style={{ flex: 1, background: "transparent", border: "none", color: textColor, outline: "none", fontSize: "1rem" }} 
          />
        </div>
      </header>
    );
  }

  return (
    <header style={macGlassStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "1rem" : "1.5rem", flex: 1 }}>
        <Link to="/" style={{ textDecoration: "none", color: "white" }}>
          <div style={{ 
            width: "40px", height: "40px", borderRadius: "8px", 
            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", 
            fontWeight: "bold", fontSize: "1.2rem", boxShadow: "0 2px 10px rgba(99, 102, 241, 0.4)", flexShrink: 0
          }}>
            W
          </div>
        </Link>

        {isMobile ? (
          <button onClick={() => setIsMobileSearchOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <Search size={22} color={iconColor} />
          </button>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", width: "100%", maxWidth: "280px",
            background: isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.04)", borderRadius: "8px",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)",
            transition: "background-color 0.3s ease",
          }}>
            <Search size={16} color={iconColor} />
            <input type="text" placeholder="Search Writespace..." style={{ background: "transparent", border: "none", color: textColor, outline: "none", width: "100%", fontSize: "0.85rem" }} />
          </div>
        )}
      </div>

      {isMobile ? (
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: iconColor }}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      ) : (
        <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Link to="/home" style={getNavItemStyle("/home")}><Home size={22} /><span>Home</span></Link>
          <Link to="/messages" style={getNavItemStyle("/messages")}><MessageSquare size={22} /><span>Message</span></Link>
          <Link to="/notifications" style={getNavItemStyle("/notifications")}><Bell size={22} /><span>Notifications</span></Link>
          <button onClick={toggleTheme} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: iconColor, fontSize: "0.75rem", fontWeight: "500", padding: 0 }}>
            {isDark ? <Sun size={22} /> : <Moon size={22} />}<span>{isDark ? "Light" : "Dark"}</span>
          </button>
          <div style={{ ...getNavItemStyle("/profile"), marginLeft: "0.5rem" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: isDark ? "#334155" : "#e2e8f0", border: isDark ? "2px solid rgba(255,255,255,0.2)" : "2px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {profileImageUrl ? <img src={profileImageUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={18} color={iconColor} />}
            </div>
            <span>Me</span>
          </div>
        </nav>
      )}

      {isMobile && isMobileMenuOpen && (
        <div style={{ position: "absolute", top: "64px", left: 0, right: 0, backgroundColor: isDark ? "#0f172a" : "#ffffff", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
           <Link to="/home" onClick={() => setIsMobileMenuOpen(false)} style={{...getNavItemStyle("/home"), flexDirection: "row", justifyContent: "flex-start", fontSize: "1rem"}}><Home size={20} /><span>Home</span></Link>
           <Link to="/messages" onClick={() => setIsMobileMenuOpen(false)} style={{...getNavItemStyle("/messages"), flexDirection: "row", justifyContent: "flex-start", fontSize: "1rem"}}><MessageSquare size={20} /><span>Messages</span></Link>
           <Link to="/notifications" onClick={() => setIsMobileMenuOpen(false)} style={{...getNavItemStyle("/notifications"), flexDirection: "row", justifyContent: "flex-start", fontSize: "1rem"}}><Bell size={20} /><span>Notifications</span></Link>
           <button onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", color: iconColor, fontSize: "1rem", fontWeight: "500", padding: 0 }}>
             {isDark ? <Sun size={20} /> : <Moon size={20} />}<span>Toggle Theme</span>
           </button>
        </div>
      )}
    </header>
  );
};

export default Header;