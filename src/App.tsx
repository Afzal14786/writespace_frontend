import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage";
import Profile from "./components/users/Profile";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import HomePage from "./pages/home/HomePage";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Helper component to redirect authenticated users away from the login page
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return null; // Awaiting initial auth check
  }
  
  return isAuthenticated ? <Navigate to="/home" replace /> : <>{children}</>;
};

// Create a wrapper component to access the theme context for the toasts and routes
const AppContent = () => {
  const { theme } = useTheme();
  
  return (
    <>
      <ToastContainer 
        position="bottom-right" 
        autoClose={3000} 
        theme={theme === "dark" ? "dark" : "light"} 
      />
      
      <Routes>
        {/* Unified Public Auth Route */}
        <Route path="/login" element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        } />
        
        {/* Redirect old register to the unified AuthPage */}
        <Route path="/register" element={<Navigate to="/login" replace />} />

        {/* Completely Protected App Area */}
        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/messages" element={<div style={{ padding: "2rem" }}>Messages</div>} />
          <Route path="/notifications" element={<div style={{ padding: "2rem" }}>Notifications</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;