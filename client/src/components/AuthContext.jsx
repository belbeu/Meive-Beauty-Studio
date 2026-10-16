import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se já existe uma sessão salva no localStorage ao carregar a página
    const checkSession = async () => {
      try {
        const savedUser = JSON.parse(localStorage.getItem('@Studio:user'));
        if (savedUser && savedUser.role === 'admin') {
          setUser(savedUser);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const loginAdmin = async (email, password) => {
    // Validação inicial (você pode integrar com seu backend ou Supabase futuramente)
    if (email === "admin@studio.com" && password === "senha123") {
      const adminData = { email, role: 'admin', token: 'mock-jwt-token-123' };
      setUser(adminData);
      localStorage.setItem('@Studio:user', JSON.stringify(adminData));
      return { success: true };
    }
    return { success: false, message: "Credenciais inválidas ou sem permissão de administrador." };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('@Studio:user');
    window.location.href = '/Meive-Beauty-Studio/admin/login';
  };

  return (
    <AuthContext.Provider value={{ user, loginAdmin, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);