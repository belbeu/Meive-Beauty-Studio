import React, { createContext, useContext, useEffect, useState } from "react";
import {
  login,
  logout as limparSessao,
  estaLogado,
  usuarioAtual,
} from "../../auth";

const AuthContext = createContext({});

// Só quem é ADMIN no banco vira "admin" no painel.
function comoAdmin(usuario) {
  if (!usuario || usuario.tipo !== "ADMIN") return null;
  return {
    id: usuario.id_usuario,
    nome: usuario.nome,
    email: usuario.email,
    role: "admin",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se existe um token salvo, o servidor confirma quem é a pessoa.
    // Nada que o navegador guarda sozinho (como um "role") é aceito como prova.
    let ativo = true;

    async function verificarSessao() {
      if (estaLogado()) {
        try {
          const usuario = await usuarioAtual();
          if (ativo) setUser(comoAdmin(usuario));
        } catch (error) {
          console.error("Sessão inválida ou expirada", error);
        }
      }
      if (ativo) setLoading(false);
    }

    verificarSessao();
    return () => {
      ativo = false;
    };
  }, []);

  const loginAdmin = async (email, password) => {
    try {
      const usuario = await login(email, password);
      const admin = comoAdmin(usuario);

      if (!admin) {
        limparSessao();
        return {
          success: false,
          message: "Credenciais inválidas ou sem permissão de administrador.",
        };
      }

      setUser(admin);
      return { success: true };
    } catch (error) {
      if (error.status === 401) {
        return {
          success: false,
          message: "Credenciais inválidas ou sem permissão de administrador.",
        };
      }
      return {
        success: false,
        message: "Não foi possível entrar agora. Tente novamente em instantes.",
      };
    }
  };

  const logout = () => {
    limparSessao();
    setUser(null);
    window.location.href = `${import.meta.env.BASE_URL}admin/login`;
  };

  return (
    <AuthContext.Provider value={{ user, loginAdmin, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
