import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const footerStyle: React.CSSProperties = {
    padding: "1.5rem 2rem",
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: "center",
    justifyContent: isMobile ? "center" : "space-between",
    gap: isMobile ? "1rem" : "0",
    backgroundColor: isDark ? "rgba(15, 23, 42, 0.4)" : "rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)",
    color: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(15, 23, 42, 0.5)",
    fontSize: "0.8rem",
    marginTop: "auto", 
  };

  return (
    <footer style={footerStyle}>
      <div style={{ textAlign: "center" }}>
        &copy; {new Date().getFullYear()} Writespace. All rights reserved.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1.5rem" }}>
        <span style={{ cursor: "pointer" }}>About</span>
        <span style={{ cursor: "pointer" }}>Privacy Policy</span>
        <span style={{ cursor: "pointer" }}>Terms of Service</span>
      </div>
    </footer>
  );
};

export default Footer;