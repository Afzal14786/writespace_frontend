import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginComponent from "./components/auth/LoginComponent";
import RegisterComponent from "./components/auth/RegisterComponent";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/home/HomePage";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// --- React Toastify Imports ---
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Create a wrapper component to access the theme context for the toasts
const AppContent = () => {
  const { theme } = useTheme();
  
  return (
    <>
      {/* Global Toast Container synced with your dark/light theme */}
      <ToastContainer 
        position="bottom-right" 
        autoClose={3000} 
        theme={theme === "dark" ? "dark" : "light"} 
      />
      
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/register" element={<RegisterComponent />} />

          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/messages" element={<div style={{ padding: "2rem" }}>Messages</div>} />
            <Route path="/notifications" element={<div style={{ padding: "2rem" }}>Notifications</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;