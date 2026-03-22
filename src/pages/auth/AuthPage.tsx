import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Github, ArrowRight, Loader2, Code, FileText, Beaker, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { AuthAPI } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";

type AuthMode = "LOGIN" | "REGISTER" | "OTP";

interface BackendError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginState } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>("LOGIN");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({ 
    fullname: "", 
    username: "", 
    email: "", 
    password: "", 
    otp: "" 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "REGISTER") {
        await AuthAPI.register({ 
          fullname: formData.fullname, 
          username: formData.username, 
          email: formData.email, 
          password: formData.password 
        });
        toast.success("Verification code sent to your email!");
        setMode("OTP");
      } 
      else if (mode === "OTP") {
        const response = await AuthAPI.verifyOtp({ 
          email: formData.email, 
          otp: formData.otp 
        });
        loginState(response.user, response.accessToken, response.refreshToken);
        toast.success("Welcome to Writespace!");
        navigate("/home");
      } 
      else if (mode === "LOGIN") {
        const response = await AuthAPI.login({ 
          email: formData.email, 
          password: formData.password 
        });
        loginState(response.user, response.accessToken, response.refreshToken);
        toast.success("Welcome back!");
        navigate("/home");
      }
    } catch (error: unknown) {
      const err = error as BackendError;
      toast.error(err.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider: "google" | "github") => {
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/auth/${provider}`;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#0f172a", color: "#f1f5f9", fontFamily: "Inter, sans-serif" }}>
      
      {/* ================= LEFT PANE ================= */}
      <div 
        style={{ 
          flex: 1, 
          display: "none", 
          padding: "3rem", 
          flexDirection: "column", 
          justifyContent: "center", 
          position: "relative", 
          overflow: "hidden", 
          background: "radial-gradient(circle at top left, rgba(99, 102, 241, 0.15), transparent 50%), radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.15), transparent 50%)" 
        }}
        className="auth-left-pane"
      >
        <style>
          {`
            @media (min-width: 768px) {
              .auth-left-pane { display: flex !important; }
            }
          `}
        </style>
        
        <div style={{ zIndex: 10, maxWidth: "500px", margin: "0 auto" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.8rem", marginBottom: "2.5rem", boxShadow: "0 10px 25px rgba(99, 102, 241, 0.4)" }}>W</div>
          
          <h1 style={{ fontSize: "3.2rem", fontWeight: 800, lineHeight: 1.1, marginBottom: "1.5rem", background: "linear-gradient(to right, #ffffff, #cbd5e1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-1px" }}>
            The Context-Aware Professional Canvas.
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#94a3b8", lineHeight: 1.6, marginBottom: "3rem" }}>
            Share rich text, complex code snippets, and scientific formulas. Build a portfolio that actually speaks your language.
          </p>

          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ padding: "1.2rem", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(10px)", flex: 1 }}>
              <Code size={28} color="#818cf8" style={{ marginBottom: "0.8rem" }}/>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#f8fafc" }}>Syntax Highlighting</h3>
            </div>
            <div style={{ padding: "1.2rem", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(10px)", flex: 1 }}>
              <Beaker size={28} color="#a855f7" style={{ marginBottom: "0.8rem" }}/>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#f8fafc" }}>Bio-Tech Ready</h3>
            </div>
            <div style={{ padding: "1.2rem", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(10px)", flex: 1 }}>
              <FileText size={28} color="#38bdf8" style={{ marginBottom: "0.8rem" }}/>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#f8fafc" }}>Rich Editor</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANE: Glassmorphic Auth Form ================= */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", position: "relative" }}>
        
        <div style={{ position: "absolute", width: "300px", height: "300px", background: "#6366f1", filter: "blur(120px)", opacity: 0.2, borderRadius: "50%", zIndex: 0 }} />

        <div style={{ width: "100%", maxWidth: "440px", zIndex: 10, backgroundColor: "rgba(30, 41, 59, 0.6)", padding: "2.5rem 2rem", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(24px)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
          
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem", color: "#f8fafc" }}>
              {mode === "LOGIN" ? "Welcome back" : mode === "REGISTER" ? "Create an account" : "Verify your email"}
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
              {mode === "LOGIN" ? "Enter your details to access your canvas." : mode === "REGISTER" ? "Join the community of professionals." : `We sent a code to ${formData.email}`}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {mode === "REGISTER" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ position: "relative" }}>
                  <User size={18} color="#64748b" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
                  <input required type="text" name="fullname" placeholder="Full Name" value={formData.fullname} onChange={handleChange} style={{ boxSizing: "border-box", width: "100%", padding: "14px 14px 14px 44px", backgroundColor: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", outline: "none", fontSize: "0.95rem", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                </div>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontWeight: "bold" }}>@</span>
                  <input required type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} style={{ boxSizing: "border-box", width: "100%", padding: "14px 14px 14px 44px", backgroundColor: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", outline: "none", fontSize: "0.95rem", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                </div>
              </div>
            )}

            {mode !== "OTP" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ position: "relative" }}>
                  <Mail size={18} color="#64748b" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
                  <input required type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} style={{ boxSizing: "border-box", width: "100%", padding: "14px 14px 14px 44px", backgroundColor: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", outline: "none", fontSize: "0.95rem", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                </div>
                <div style={{ position: "relative" }}>
                  <Lock size={18} color="#64748b" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
                  <input required type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} style={{ boxSizing: "border-box", width: "100%", padding: "14px 48px 14px 44px", backgroundColor: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", outline: "none", fontSize: "0.95rem", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  <button 
                    type="button" 
                    onClick={togglePasswordVisibility} 
                    style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {mode === "OTP" && (
              <div style={{ position: "relative", marginTop: "0.5rem" }}>
                <input required type="text" name="otp" placeholder="6-Digit OTP" value={formData.otp} onChange={handleChange} maxLength={6} style={{ boxSizing: "border-box", width: "100%", padding: "16px", backgroundColor: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", outline: "none", fontSize: "1.2rem", letterSpacing: formData.otp ? "8px" : "1px", textAlign: "center", transition: "border-color 0.2s", fontWeight: 600 }} onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
            )}

            <button disabled={isLoading} type="submit" style={{ boxSizing: "border-box", width: "100%", padding: "14px", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "12px", fontSize: "1rem", fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "1rem", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.backgroundColor = "#4f46e5"} onMouseOut={e => e.currentTarget.style.backgroundColor = "#6366f1"}>
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : mode === "LOGIN" ? "Sign In" : mode === "REGISTER" ? "Create Account" : "Verify & Continue"}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          {mode === "LOGIN" && (
            <div style={{ marginTop: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.1)", flex: 1 }} />
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>OR CONTINUE WITH</span>
                <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.1)", flex: 1 }} />
              </div>
              
              <div style={{ display: "flex", gap: "1rem" }}>
                <button onClick={() => handleOAuth("google")} style={{ flex: 1, padding: "12px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", fontWeight: 500, transition: "all 0.2s" }} onMouseOver={e => {e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}} onMouseOut={e => {e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}}>
                   <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: "18px" }} /> Google
                </button>
                <button onClick={() => handleOAuth("github")} style={{ flex: 1, padding: "12px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", fontWeight: 500, transition: "all 0.2s" }} onMouseOver={e => {e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}} onMouseOut={e => {e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}}>
                   <Github size={18} /> GitHub
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem", color: "#94a3b8" }}>
            {mode === "LOGIN" ? (
              <>Don't have an account? <button onClick={() => setMode("REGISTER")} style={{ background: "none", border: "none", color: "#818cf8", fontWeight: 600, cursor: "pointer", padding: "0 0 0 6px" }}>Sign up</button></>
            ) : mode === "REGISTER" ? (
              <>Already have an account? <button onClick={() => setMode("LOGIN")} style={{ background: "none", border: "none", color: "#818cf8", fontWeight: 600, cursor: "pointer", padding: "0 0 0 6px" }}>Log in</button></>
            ) : null}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;