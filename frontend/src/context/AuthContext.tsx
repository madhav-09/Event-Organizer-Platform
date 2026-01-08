import { createContext, useContext, useState } from "react";

export type Role = "ADMIN" | "USER" | "ORGANIZER";

export type User = {
  role: Role;
};

type LoginResponse = {
  access_token: string;
  role: Role;
};

type AuthContextType = {
  user: User | null;
  login: (data: LoginResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const role = localStorage.getItem("role");
    return role ? { role: role as Role } : null;
  });

  const login = (data: LoginResponse) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", data.role);
    setUser({ role: data.role });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
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
