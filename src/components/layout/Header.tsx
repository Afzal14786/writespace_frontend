import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Home, MessageSquare, Bell, User, Sun, Moon, Menu, X, ArrowLeft, ChevronDown } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "react-toastify";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  // --- State ---
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  // Dummy profile data (Replace with context/auth data later)
  const profileImageUrl = ""; 
  const userName = "Afzal";
  const userHeadline = "Aspiring AI Engineer | MERN Stack Specialist";

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle clicking outside the profile dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      if (profileMenuRef.current && targetNode && typeof profileMenuRef.current.contains === 'function') {
        if (!profileMenuRef.current.contains(targetNode)) {
          setIsProfileMenuOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isMobile = windowWidth < 768;
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const iconColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(15,23,42,0.6)";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = isDark ? "#818cf8" : "#0a66c2"; // LinkedIn Blue
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";

  const macGlassStyle: React.CSSProperties = {
    position: "fixed", top: 0, left: 0, right: 0, height: "64px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: isMobile ? "0 1rem" : "0 2rem",
    backgroundColor: isDark ? "rgba(15, 23, 42, 0.65)" : "rgba(255, 255, 255, 0.75)",
    backdropFilter: "saturate(180%) blur(20px)",
    WebkitBackdropFilter: "saturate(180%) blur(20px)",
    borderBottom: `1px solid ${borderColor}`,
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
      color: isActive ? (isDark ? "#fff" : "#191919") : iconColor,
      fontSize: "0.75rem", fontWeight: isActive ? "600" : "500",
    };
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    setIsProfileMenuOpen(false);
    toast.success("Signed out successfully");
    navigate("/login");
  };

  // Shared hover logic for dropdown links
  const handleLinkHover = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.textDecoration = "underline";
  };
  const handleLinkLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.textDecoration = "none";
  };

  // --- Mobile Search View ---
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
            width: "36px", height: "36px", borderRadius: "4px", 
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
            background: isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.04)", borderRadius: "4px",
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
          
          {/* Profile Dropdown Container */}
          <div ref={profileMenuRef} style={{ position: "relative" }}>
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              style={{ ...getNavItemStyle("/profile"), marginLeft: "0.5rem", background: "none", border: "none" }}
            >
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: isDark ? "#334155" : "#e2e8f0", border: isDark ? "2px solid rgba(255,255,255,0.2)" : "2px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {profileImageUrl ? <img src={profileImageUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={14} color={iconColor} />}
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span>Me</span>
                <ChevronDown size={14} style={{ marginLeft: "2px", transform: isProfileMenuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </div>
            </button>

            {/* Profile Dropdown Menu (LinkedIn Style) */}
            {isProfileMenuOpen && (
              <div style={{ position: "absolute", top: "120%", right: 0, width: "272px", backgroundColor: isDark ? "#1e293b" : "#ffffff", border: `1px solid ${borderColor}`, borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", overflow: "hidden", display: "flex", flexDirection: "column", animation: "fadeIn 0.2s", fontFamily: "Inter, sans-serif" }}>
                
                {/* 1. Profile Preview & View Profile Button */}
                <div style={{ padding: "16px 16px 8px 16px", borderBottom: `1px solid ${borderColor}` }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: isDark ? "#334155" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                      {profileImageUrl ? <img src={profileImageUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={32} color={mutedText} />}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, paddingTop: "2px" }}>
                      <span style={{ fontWeight: 600, fontSize: "1rem", color: textColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: "1.2" }}>{userName}</span>
                      <span style={{ fontSize: "0.85rem", color: textColor, marginTop: "4px", lineHeight: "1.3" }}>{userHeadline}</span>
                    </div>
                  </div>
                  <Link 
                    to="/profile" 
                    onClick={() => setIsProfileMenuOpen(false)} 
                    style={{ display: "block", width: "100%", textAlign: "center", padding: "4px 0", borderRadius: "24px", border: `1px solid ${accentColor}`, color: accentColor, fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", transition: "background-color 0.2s" }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = isDark ? "rgba(129, 140, 248, 0.1)" : "rgba(10, 102, 194, 0.1)"}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    View Profile
                  </Link>
                </div>

                {/* 2. Account Section */}
                <div style={{ padding: "12px 0", borderBottom: `1px solid ${borderColor}` }}>
                  <h4 style={{ margin: "0 16px 8px 16px", fontSize: "0.9rem", fontWeight: 600, color: textColor }}>Account</h4>
                  <Link to="/settings" onClick={() => setIsProfileMenuOpen(false)} style={{ display: "block", padding: "4px 16px", color: mutedText, fontSize: "0.85rem", textDecoration: "none" }} onMouseOver={handleLinkHover} onMouseOut={handleLinkLeave}>
                    Settings & Privacy
                  </Link>
                  <Link to="/help" onClick={() => setIsProfileMenuOpen(false)} style={{ display: "block", padding: "4px 16px", color: mutedText, fontSize: "0.85rem", textDecoration: "none" }} onMouseOver={handleLinkHover} onMouseOut={handleLinkLeave}>
                    Help
                  </Link>
                  <Link to="/language" onClick={() => setIsProfileMenuOpen(false)} style={{ display: "block", padding: "4px 16px", color: mutedText, fontSize: "0.85rem", textDecoration: "none" }} onMouseOver={handleLinkHover} onMouseOut={handleLinkLeave}>
                    Language
                  </Link>
                </div>

                {/* 3. Manage Section */}
                <div style={{ padding: "12px 0", borderBottom: `1px solid ${borderColor}` }}>
                  <h4 style={{ margin: "0 16px 8px 16px", fontSize: "0.9rem", fontWeight: 600, color: textColor }}>Manage</h4>
                  <Link to="/profile/posts" onClick={() => setIsProfileMenuOpen(false)} style={{ display: "block", padding: "4px 16px", color: mutedText, fontSize: "0.85rem", textDecoration: "none" }} onMouseOver={handleLinkHover} onMouseOut={handleLinkLeave}>
                    Posts & Activity
                  </Link>
                </div>

                {/* 4. Sign Out */}
                <div style={{ padding: "8px 0" }}>
                  <button 
                    onClick={handleLogout} 
                    style={{ width: "100%", display: "block", background: "none", border: "none", cursor: "pointer", color: mutedText, fontSize: "0.85rem", padding: "4px 16px", textAlign: "left" }}
                    onMouseOver={handleLinkHover} onMouseOut={handleLinkLeave}
                  >
                    Sign Out
                  </button>
                </div>

              </div>
            )}
          </div>
        </nav>
      )}

      {/* Mobile Slide-out Menu */}
      {isMobile && isMobileMenuOpen && (
        <div style={{ position: "absolute", top: "64px", left: 0, right: 0, backgroundColor: isDark ? "#0f172a" : "#ffffff", borderBottom: `1px solid ${borderColor}`, padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
           
           {/* Mobile Profile Preview Header */}
           <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", paddingBottom: "16px", borderBottom: `1px solid ${borderColor}` }}>
             <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: isDark ? "#334155" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
               {profileImageUrl ? <img src={profileImageUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={28} color={mutedText} />}
             </div>
             <div style={{ display: "flex", flexDirection: "column", minWidth: 0, paddingTop: "2px", flex: 1 }}>
               <span style={{ fontWeight: 600, fontSize: "1rem", color: textColor, lineHeight: 1.2 }}>{userName}</span>
               <span style={{ fontSize: "0.85rem", color: textColor, marginTop: "4px", lineHeight: 1.3 }}>{userHeadline}</span>
               <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} style={{ display: "block", width: "100%", textAlign: "center", padding: "4px 0", borderRadius: "24px", border: `1px solid ${accentColor}`, color: accentColor, fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", marginTop: "12px" }}>
                 View Profile
               </Link>
             </div>
           </div>

           <Link to="/home" onClick={() => setIsMobileMenuOpen(false)} style={{...getNavItemStyle("/home"), flexDirection: "row", justifyContent: "flex-start", fontSize: "1rem"}}><Home size={20} /><span>Home</span></Link>
           <Link to="/messages" onClick={() => setIsMobileMenuOpen(false)} style={{...getNavItemStyle("/messages"), flexDirection: "row", justifyContent: "flex-start", fontSize: "1rem"}}><MessageSquare size={20} /><span>Messages</span></Link>
           <Link to="/notifications" onClick={() => setIsMobileMenuOpen(false)} style={{...getNavItemStyle("/notifications"), flexDirection: "row", justifyContent: "flex-start", fontSize: "1rem"}}><Bell size={20} /><span>Notifications</span></Link>
           
           <div style={{ borderTop: `1px solid ${borderColor}`, margin: "0.5rem 0" }} />
           
           <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: textColor }}>Account</h4>
           <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} style={{ color: mutedText, fontSize: "0.9rem", textDecoration: "none" }}>Settings & Privacy</Link>
           <Link to="/help" onClick={() => setIsMobileMenuOpen(false)} style={{ color: mutedText, fontSize: "0.9rem", textDecoration: "none" }}>Help</Link>
           
           <div style={{ borderTop: `1px solid ${borderColor}`, margin: "0.5rem 0" }} />
           
           <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: textColor }}>Manage</h4>
           <Link to="/profile/posts" onClick={() => setIsMobileMenuOpen(false)} style={{ color: mutedText, fontSize: "0.9rem", textDecoration: "none" }}>Posts & Activity</Link>

           <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: "1rem", marginTop: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <button onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: textColor, fontSize: "0.9rem", fontWeight: "500", padding: 0 }}>
               {isDark ? <Sun size={18} /> : <Moon size={18} />}<span>Theme</span>
             </button>
             <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", background: "none", border: "none", color: mutedText, fontSize: "0.9rem", fontWeight: 500, cursor: "pointer", padding: 0 }}>
               Sign Out
             </button>
           </div>
        </div>
      )}
    </header>
  );
};

export default Header;