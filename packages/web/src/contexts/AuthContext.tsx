import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { authClient } from "../api/auth-client";
import { AuthUser } from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authClient.me();
      setUser(response.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser()
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (input: { email: string; password: string }) => {
    const response = await authClient.login(input);
    setUser(response.user);
  }, []);

  const register = useCallback(async (input: { email: string; password: string; name: string }) => {
    const response = await authClient.register(input);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    await authClient.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [isLoading, login, logout, refreshUser, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
