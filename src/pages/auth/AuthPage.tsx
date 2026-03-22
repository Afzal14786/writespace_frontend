import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Github, ArrowRight, Loader2, Code, FileText, Beaker, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { AuthAPI } from "../../api/auth.api";
import { UsersAPI } from "../../api/users.api";
import { useAuth } from "../../context/AuthContext";

type AuthMode = "LOGIN" | "REGISTER" | "OTP";
type UsernameStatus = "IDLE" | "LOADING" | "AVAILABLE" | "UNAVAILABLE";

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("IDLE");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({ 
    fullname: "", 
    username: "", 
    email: "", 
    password: "", 
    otp: "" 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (mode !== "REGISTER") return;
    if (!formData.username || formData.username.length < 3) {
      setUsernameStatus("IDLE");
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus("LOADING");
      try {
        const result = await UsersAPI.checkUsername(formData.username);
        if (result.available) {
          setUsernameStatus("AVAILABLE");
          setSuggestions([]);
        } else {
          setUsernameStatus("UNAVAILABLE");
          setSuggestions(result.suggestions || []);
        }
      } catch {
        setUsernameStatus("IDLE");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, mode]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (mode === "REGISTER" && usernameStatus === "UNAVAILABLE") {
      toast.error("Username is already taken.");
      return;
    }
    setIsLoading(true);

    try {
      if (mode === "REGISTER") {
        await AuthAPI.register({ fullname: formData.fullname, username: formData.username, email: formData.email, password: formData.password });
        toast.success("OTP sent to your email!");
        setMode("OTP");
      } 
      else if (mode === "OTP") {
        const response = await AuthAPI.verifyOtp({ email: formData.email, otp: formData.otp });
        loginState(response.user, response.accessToken, response.refreshToken);
        navigate("/home");
      } 
      else if (mode === "LOGIN") {
        const response = await AuthAPI.login({ email: formData.email, password: formData.password });
        loginState(response.user, response.accessToken, response.refreshToken);
        navigate("/home");
      }
    } catch (error: unknown) {
      const err = error as BackendError;
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider: "google" | "github"): void => {
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/auth/${provider}`;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#0f172a", color: "#f1f5f9", fontFamily: "Inter, sans-serif" }}>
      
      <style>{`
        @media (max-width: 767px) { .desktop-only { display: none !important; } }
        @media (min-width: 768px) { .mobile-only { display: none !important; } }
        .input-focus:focus { border-color: #6366f1 !important; }
      `}</style>

      {/* ================= LEFT PANE: Feature Showcase ================= */}
      <div className="desktop-only" style={{ flex: 1, padding: "3rem", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden", background: "radial-gradient(circle at top left, rgba(99, 102, 241, 0.15), transparent 50%), radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.15), transparent 50%)" }}>
        <div style={{ zIndex: 10, maxWidth: "550px", margin: "0 auto" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.8rem", marginBottom: "2.5rem" }}>W</div>
          <h1 style={{ fontSize: "3.2rem", fontWeight: 800, lineHeight: 1.1, marginBottom: "1.5rem", background: "linear-gradient(to right, #ffffff, #cbd5e1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>The Context-Aware Professional Canvas.</h1>
          <p style={{ fontSize: "1.1rem", color: "#94a3b8", lineHeight: 1.6, marginBottom: "3rem" }}>A home for builders, writers, and scientists. Your profile dynamically adapts to showcase your true proof of work.</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            
            {/* Box 1: Syntax Highlighting */}
            <div style={{ padding: "1.2rem", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <Code size={20} color="#818cf8" />
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#f8fafc" }}>Developer Native</span>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#94a3b8", backgroundColor: "rgba(0,0,0,0.2)", padding: "8px", borderRadius: "6px" }}>
                <span style={{ color: "#c084fc" }}>const</span> <span style={{ color: "#60a5fa" }}>writespace</span> = () ={">"} {"{"} <br />
                &nbsp;&nbsp;return <span style={{ color: "#4ade80" }}>"Where code lives"</span>;<br />
                {"}"};
              </div>
            </div>

            {/* Box 2: Bio-Tech / Formulas */}
            <div style={{ padding: "1.2rem", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <Beaker size={20} color="#a855f7" />
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#f8fafc" }}>Scientific Precision</span>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#cbd5e1", fontStyle: "italic" }}>
                Supporting LaTeX for complex derivations: <br />
                <span style={{ fontSize: "1rem", color: "#f8fafc" }}>E = mc² &nbsp; | &nbsp; ΔG = ΔH - TΔS</span>
              </div>
            </div>

            {/* Box 3: Rich Editor */}
            <div style={{ padding: "1.2rem", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <FileText size={20} color="#38bdf8" />
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#f8fafc" }}>Thoughtful Writing</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                Publish long-form articles with a robust Tiptap-powered editor. Images, embeds, and rich formatting.
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================= RIGHT PANE: Auth Form (Stays same but with box-sizing fix) ================= */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem", position: "relative" }}>
        <div className="mobile-only" style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.4rem" }}>W</div>
          <span style={{ marginTop: "0.5rem", fontWeight: 700, fontSize: "1.2rem", letterSpacing: "1px" }}>WRITESPACE</span>
        </div>
        <div style={{ position: "absolute", width: "300px", height: "300px", background: "#6366f1", filter: "blur(120px)", opacity: 0.15, borderRadius: "50%", zIndex: 0 }} />
        <div style={{ width: "100%", maxWidth: "440px", zIndex: 10, backgroundColor: "rgba(30, 41, 59, 0.6)", padding: "2.5rem 2rem", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(24px)" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>{mode === "LOGIN" ? "Welcome back" : mode === "REGISTER" ? "Create an account" : "Verify your email"}</h2>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>{mode === "LOGIN" ? "Enter your details to access your canvas." : mode === "REGISTER" ? "Join the community of professionals." : `OTP sent to ${formData.email}`}</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {mode === "REGISTER" && (
              <>
                <div style={{ position: "relative" }}>
                  <User size={18} color="#64748b" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
                  <input required name="fullname" placeholder="Full Name" value={formData.fullname} onChange={handleChange} className="input-focus" style={{ boxSizing: "border-box", width: "100%", padding: "14px 14px 14px 44px", backgroundColor: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", outline: "none" }} />
                </div>
                <div>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontWeight: "bold" }}>@</span>
                    <input required name="username" placeholder="Username" value={formData.username} onChange={handleChange} className="input-focus" style={{ boxSizing: "border-box", width: "100%", padding: "14px 44px", backgroundColor: "rgba(15, 23, 42, 0.4)", border: usernameStatus === "UNAVAILABLE" ? "1px solid #ef4444" : usernameStatus === "AVAILABLE" ? "1px solid #22c55e" : "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", outline: "none" }} />
                    <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)" }}>
                      {usernameStatus === "LOADING" && <Loader2 size={18} className="animate-spin" color="#64748b" />}
                      {usernameStatus === "AVAILABLE" && <CheckCircle2 size={18} color="#22c55e" />}
                      {usernameStatus === "UNAVAILABLE" && <XCircle size={18} color="#ef4444" />}
                    </div>
                  </div>
                  {usernameStatus === "UNAVAILABLE" && suggestions.length > 0 && (
                    <div style={{ marginTop: "8px", padding: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "8px" }}>
                      <p style={{ fontSize: "0.75rem", color: "#fca5a5", marginBottom: "4px" }}>Suggested:</p>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {suggestions.map(s => <button key={s} type="button" onClick={() => setFormData({...formData, username: s})} style={{ fontSize: "0.7rem", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "2px 8px", borderRadius: "10px", cursor: "pointer" }}>{s}</button>)}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {mode !== "OTP" && (
              <>
                <div style={{ position: "relative" }}>
                  <Mail size={18} color="#64748b" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
                  <input required type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="input-focus" style={{ boxSizing: "border-box", width: "100%", padding: "14px 14px 14px 44px", backgroundColor: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", outline: "none" }} />
                </div>
                <div style={{ position: "relative" }}>
                  <Lock size={18} color="#64748b" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
                  <input required type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="input-focus" style={{ boxSizing: "border-box", width: "100%", padding: "14px 48px 14px 44px", backgroundColor: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", outline: "none" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </>
            )}
            {mode === "OTP" && (
              <input required name="otp" placeholder="6-Digit OTP" value={formData.otp} onChange={handleChange} maxLength={6} className="input-focus" style={{ boxSizing: "border-box", width: "100%", padding: "14px", backgroundColor: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", outline: "none", fontSize: "1.2rem", letterSpacing: "8px", textAlign: "center" }} />
            )}
            <button disabled={isLoading || (mode === "REGISTER" && usernameStatus === "UNAVAILABLE")} type="submit" style={{ boxSizing: "border-box", width: "100%", padding: "14px", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "12px", fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer", opacity: (isLoading || (mode === "REGISTER" && usernameStatus === "UNAVAILABLE")) ? 0.6 : 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "1rem" }}>
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : mode === "LOGIN" ? "Sign In" : mode === "REGISTER" ? "Create Account" : "Verify & Continue"}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>
          {mode === "LOGIN" && (
            <div style={{ marginTop: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.1)", flex: 1 }} />
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>OR CONTINUE WITH</span>
                <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.1)", flex: 1 }} />
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button onClick={() => handleOAuth("google")} style={{ flex: 1, padding: "12px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: "18px" }} /> Google
                </button>
                <button onClick={() => handleOAuth("github")} style={{ flex: 1, padding: "12px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                  <Github size={18} /> GitHub
                </button>
              </div>
            </div>
          )}
          <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem", color: "#94a3b8" }}>
            {mode === "LOGIN" ? (
              <>Don't have an account? <button onClick={() => setMode("REGISTER")} style={{ background: "none", border: "none", color: "#818cf8", fontWeight: 600, cursor: "pointer", paddingLeft: "4px" }}>Sign up</button></>
            ) : mode === "REGISTER" ? (
              <>Already have an account? <button onClick={() => setMode("LOGIN")} style={{ background: "none", border: "none", color: "#818cf8", fontWeight: 600, cursor: "pointer", paddingLeft: "4px" }}>Log in</button></>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;