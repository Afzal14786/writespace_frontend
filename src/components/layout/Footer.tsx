import React from "react";
import { useTheme } from "../../context/ThemeContext";

interface FooterProps {
  variant?: 'auth' | 'app';
}

const Footer: React.FC<FooterProps> = ({ variant = 'app' }) => {
  const { theme } = useTheme();
  
  if (variant === 'auth') {
    return (
      <footer className="w-full py-5 px-8 bg-transparent">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.8rem] font-medium text-slate-500">
          <div className="text-center sm:text-left cursor-default">
            &copy; {new Date().getFullYear()} Writespace.
          </div>
          <div className="flex flex-wrap justify-center gap-6">
             <a href="#" className="hover:text-slate-300 transition-colors cursor-pointer">Docs</a>
             <a href="#" className="hover:text-slate-300 transition-colors cursor-pointer">GitHub</a>
             <a href="#" className="hover:text-slate-300 transition-colors cursor-pointer">Contact</a>
             <a href="#" className="hover:text-slate-300 transition-colors cursor-pointer">Privacy</a>
          </div>
        </div>
      </footer>
    );
  }

  // App layout footer remains unchanged...
  return (
    <footer className={`w-full py-6 px-8 mt-auto backdrop-blur-md transition-colors border-t ${
      theme === 'dark' 
        ? 'bg-slate-900/40 border-slate-800 text-slate-400' 
        : 'bg-white/50 border-slate-200 text-slate-500'
    }`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-medium">
        <div className="text-center sm:text-left cursor-default">
          &copy; {new Date().getFullYear()} Writespace. All rights reserved.
        </div>
        <div className="flex flex-wrap justify-center gap-6">
           <a href="#" className="hover:text-indigo-500 transition-colors cursor-pointer">Docs</a>
           <a href="#" className="hover:text-indigo-500 transition-colors cursor-pointer">GitHub</a>
           <a href="#" className="hover:text-indigo-500 transition-colors cursor-pointer">Contact</a>
           <a href="#" className="hover:text-indigo-500 transition-colors cursor-pointer">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;