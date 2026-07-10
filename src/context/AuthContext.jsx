import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { loginWithToken } from "../services/authApi.js";

const AuthContext = createContext(null);
const SESSION_KEY = "mcq_arena_session";

function safeUuid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const login = useCallback(async ({ email, passwordToken }) => {
    setIsAuthenticating(true);
    try {
      const response = await loginWithToken({ email, passwordToken });
      if (!response.ok) {
        return { ok: false, message: response.message || "Invalid email or password token." };
      }

      const nextSession = {
        email: response.user.email,
        name: response.user.name || response.user.email.split("@")[0],
        token: response.sessionToken || safeUuid(),
        loginAt: new Date().toISOString()
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      return { ok: true };
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session,
      isAuthenticated: Boolean(session?.email),
      isAuthenticating,
      login,
      logout
    }),
    [isAuthenticating, login, logout, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
