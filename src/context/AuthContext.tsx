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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("accessToken"));
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

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

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoadingAuth(false);
        return;
      }

      try {
        const userData = await UsersAPI.getMe();
        setUser(userData);
        setAccessToken(token);
      } catch (error) {
        console.error("Session verification failed. Logging out.", error);
        logoutState(); // Only clears token if backend confirms it's actually invalid
      } finally {
        setIsLoadingAuth(false);
      }
    };

    initializeAuth();
  }, [logoutState]);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isAuthenticated: !!user && !!accessToken,
      isLoadingAuth,
      loginState,
      logoutState
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