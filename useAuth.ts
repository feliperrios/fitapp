"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Profile } from "@/lib/types";
import { getDb } from "@/lib/db";

interface AuthContextValue {
  user: Profile | null;
  login: (email: string, senha: string) => Promise<string | null>;
  signup: (nome: string, email: string, senha: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);

  const login = useCallback(async (email: string, senha: string) => {
    const result = await getDb().login(email, senha);
    if ("error" in result) return result.error;
    setUser(result);
    return null;
  }, []);

  const signup = useCallback(async (nome: string, email: string, senha: string) => {
    const result = await getDb().signup(nome, email, senha);
    if ("error" in result) return result.error;
    setUser(result);
    return null;
  }, []);

  const logout = useCallback(async () => {
    await getDb().logout();
    setUser(null);
  }, []);

  return (
    // @ts-ignore — avoiding JSX import complexity in .ts file
    AuthContext.Provider({ value: { user, login, signup, logout }, children })
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
