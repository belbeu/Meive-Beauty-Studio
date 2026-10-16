import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute() {
  const { user } = useAuth();

  // Se não estiver autenticado OU não tiver o papel de admin, manda pro login ADM
  if (!user || user.role !== 'admin') {
    return <Navigate to="/adm/login" replace />;
  }

  // Se estiver tudo certo, renderiza as rotas filhas do painel administrativo
  return <Outlet />;
}