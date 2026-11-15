import React, { createContext, useContext, useEffect, useState } from "react";
import {
  logout as limparSessao,
  estaLogado,
  usuarioAtual,
} from "../../auth";
import { api } from "../../api";

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
    // Não reutiliza um token antigo para iniciar uma nova autenticação administrativa.
    limparSessao();
    setUser(null);
    try {
      await api("/auth/admin/solicitar-codigo/", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      return { success: true, verificationRequired: true };
    } catch (error) {
      return {
        success: false,
        message: error.dados?.detail || "Não foi possível validar as credenciais. Tente novamente.",
      };
    }
  };

  const validarCodigoAdmin = async (email, codigo) => {
    try {
      const tokens = await api("/auth/admin/validar-codigo/", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase(), codigo }),
      });
      localStorage.setItem("access", tokens.access);
      localStorage.setItem("refresh", tokens.refresh);
      const usuario = await usuarioAtual();
      const admin = comoAdmin(usuario);
      if (!admin) {
        limparSessao();
        return { success: false, message: "Esta conta não possui permissão administrativa." };
      }
      setUser(admin);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.dados?.detail || "Código inválido ou expirado. Tente novamente.",
      };
    }
  };

  const logout = () => {
    limparSessao();
    setUser(null);
    window.location.href = `${import.meta.env.BASE_URL}admin/login`;
  };

  return (
    <AuthContext.Provider value={{ user, loginAdmin, validarCodigoAdmin, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
