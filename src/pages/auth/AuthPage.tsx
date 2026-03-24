import React, { useState, useEffect } from "react";
import LoginComponent from "../../components/auth/LoginComponent";
import RegisterComponent from "../../components/auth/RegisterComponent";
import ForgotPasswordComponent from "../../components/auth/ForgotPasswordComponent";
import ResetPasswordComponent from "../../components/auth/ResetPasswordComponent";
import AuthBranding from "../../components/auth/AuthBranding";
import Footer from "../../components/layout/Footer";

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

interface AuthPageProps {
  initialMode?: AuthMode;
}

const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-slate-900 text-slate-50 font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* Main Split Area (Takes all space above footer) */}
      <div className="flex flex-1 w-full relative">
        
        {/* Left side - Branding & Header Area (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:flex-col lg:w-1/2 h-full border-r border-slate-800/50">
          <AuthBranding />
        </div>

        {/* Right side - Form Area (Centered) */}
        <div className="flex-1 flex flex-col relative h-full">
          
          {/* Ambient Glows */}
          <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

          {/* Mobile Header (Only visible on Mobile screens) */}
          <div className="lg:hidden flex items-center justify-center gap-3 pt-8 pb-4 w-full shrink-0 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow-lg">
              W
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Writespace</span>
          </div>

          {/* Main Form Area (Mathematically centered) */}
          <div className="flex-1 flex flex-col justify-center items-center w-full px-4 sm:px-8 py-6 relative z-10 overflow-y-auto">
            <div className="w-full max-w-md bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] p-8 sm:p-10 shadow-2xl">
              {mode === 'login' && <LoginComponent onToggleForm={() => setMode('register')} onForgotPassword={() => setMode('forgot')} />}
              {mode === 'register' && <RegisterComponent onToggleForm={() => setMode('login')} />}
              {mode === 'forgot' && <ForgotPasswordComponent onBackToLogin={() => setMode('login')} />}
              {mode === 'reset' && <ResetPasswordComponent />}
            </div>
          </div>

        </div>
      </div>

      {/* Footer Area (Spans full width at the bottom) */}
      <div className="w-full shrink-0 relative z-20 border-t border-slate-800/50 bg-slate-900">
        <Footer variant="auth" />
      </div>

    </div>
  );
};

export default AuthPage;