"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { TUser, TLoginPayload, TRegisterPayload } from "@/api/auth/type";
import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
} from "@/api/auth";

type AuthContextType = {
  user: TUser | null;
  isLoading: boolean;
  login: (payload: TLoginPayload) => TUser;
  register: (payload: TRegisterPayload) => TUser;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    setIsLoading(false);
  }, []);

  const login = useCallback((payload: TLoginPayload): TUser => {
    const loggedInUser = loginUser(payload);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback((payload: TRegisterPayload): TUser => {
    const newUser = registerUser(payload);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
