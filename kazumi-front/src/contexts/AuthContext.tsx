import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";

export interface User {
  id: number;
  email: string;
  nome_completo: string;
  tipo_usuario: 'professor' | 'responsavel' | 'aluno' | 'gestor';
  telefone?: string;
  ativo: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  isProfessor: boolean;
  isGestor: boolean;
  isAluno: boolean;
  isResponsavel: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await api.get<User>("/api/users/me");
          setUser(response.data);
        } catch (error) {
          console.error("Failed to load user", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const signIn = async (email: string, senha: string) => {
    try {
      const response = await api.post("/api/auth/login", { email, senha });
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      const userResponse = await api.get<User>("/api/users/me");
      setUser(userResponse.data);
      navigate("/");
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isProfessor: user?.tipo_usuario === 'professor',
    isGestor: user?.tipo_usuario === 'gestor',
    isAluno: user?.tipo_usuario === 'aluno',
    isResponsavel: user?.tipo_usuario === 'responsavel',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
