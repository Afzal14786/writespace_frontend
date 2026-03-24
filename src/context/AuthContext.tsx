import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User } from "../types/api.types";
import { UsersAPI } from "../api/users.api";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  loginState: (user: User, accessToken: string, refreshToken: string) => void;
  logoutState: () => void;
  checkAuth: () => Promise<void>; // ADDED THIS
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cachedUser = localStorage.getItem("userData");
    return cachedUser ? JSON.parse(cachedUser) : null;
  });
  
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("accessToken"));
  
  // PERFORMANCE FIX: Only block rendering if we have a token but NO cached user data
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(() => {
    const hasToken = !!localStorage.getItem("accessToken");
    const hasCachedUser = !!localStorage.getItem("userData");
    return hasToken && !hasCachedUser;
  });

  const logoutState = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    setAccessToken(null);
    setUser(null);
  }, []);

  const loginState = useCallback((newUser: User, newAccessToken: string, newRefreshToken: string) => {
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("userData", JSON.stringify(newUser));
    setAccessToken(newAccessToken);
    setUser(newUser);
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsLoadingAuth(false);
      return;
    }

    try {
      const userData = await UsersAPI.getMe();
      setUser(userData);
      setAccessToken(token);
      localStorage.setItem("userData", JSON.stringify(userData)); // Keep cache fresh
    } catch (error) {
      console.error("Session verification failed. Logging out.", error);
      logoutState();
    } finally {
      setIsLoadingAuth(false);
    }
  }, [logoutState]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isAuthenticated: !!user && !!accessToken,
      isLoadingAuth,
      loginState,
      logoutState,
      checkAuth // PROVIDED HERE
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};