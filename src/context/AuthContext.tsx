import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "../types/api.types";
import { UsersAPI } from "../api/users.api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginState: (user: User, accessToken: string, refreshToken: string) => void;
  logoutState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Explicitly define the props interface to fix the 'any' children error
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Wrap logoutState in useCallback so it has a stable reference
  const logoutState = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    setUser(null);
  }, []);

  // Wrap loginState in useCallback as a best practice for context providers
  const loginState = useCallback((newUser: User, accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("userData", JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          // Verify token by fetching current user data
          const me = await UsersAPI.getMe();
          setUser(me);
        } catch (error: unknown) {
          console.error(error);
          logoutState(); // Safe to call now
        }
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, [logoutState]); // 2. Added logoutState to the dependency array to satisfy the linter

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, loginState, logoutState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};