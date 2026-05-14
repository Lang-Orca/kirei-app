import React, { createContext, useState, useContext, ReactNode } from 'react';

export type UserRole = 'admin' | 'client' | null;

interface AuthContextType {
  role: UserRole;
  clientName: string | null;
  login: (role: UserRole, clientName?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [clientName, setClientName] = useState<string | null>(null);

  const login = (newRole: UserRole, name?: string) => {
    setRole(newRole);
    if (name) {
      setClientName(name);
    }
  };

  const logout = () => {
    setRole(null);
    setClientName(null);
  };

  return (
    <AuthContext.Provider value={{ role, clientName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'AuthProvider');
  }
  return context;
}
