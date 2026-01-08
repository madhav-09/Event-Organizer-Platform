import { createContext, useContext, useState } from "react";

export type Role = "ADMIN" | "USER" | "ORGANIZER";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type LoginResponse = {
  access_token: string;
  user: User;
};

type AuthContextType = {
  user: User | null;
  login: (data: LoginResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored || stored === "undefined") return null;
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  });

  const login = (data: LoginResponse) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
