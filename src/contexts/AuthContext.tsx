"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios'; // Para chamadas API

// Definir a URL base da API (ajustar conforme necessário)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface User {
  _id: string;
  name: string;
  email: string;
  accessLevel: 'Administrador' | 'Gestor' | 'Operador';
  // Adicionar outros campos do usuário conforme necessário
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email_login: string, password_login: string) => Promise<void>;
  logout: () => void;
  // register: (userData: any) => Promise<void>; // Adicionar se necessário
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tentar carregar token e usuário do localStorage ao iniciar
    const storedToken = localStorage.getItem('authToken_fonoComAmor');
    const storedUser = localStorage.getItem('authUser_fonoComAmor');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email_login: string, password_login: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email: email_login, password: password_login });
      const { token: authToken, ...userData } = response.data;
      
      setUser(userData as User);
      setToken(authToken);
      localStorage.setItem('authToken_fonoComAmor', authToken);
      localStorage.setItem('authUser_fonoComAmor', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } catch (error) {
      console.error('Erro no login:', error);
      // Tratar erro de login (ex: exibir mensagem para o usuário)
      throw error; // Re-throw para que o componente de login possa tratar
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken_fonoComAmor');
    localStorage.removeItem('authUser_fonoComAmor');
    delete axios.defaults.headers.common['Authorization'];
    // Redirecionar para a página de login, se necessário (usar useRouter do Next.js)
  };

  // TODO: Implementar função de registro se necessário

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
