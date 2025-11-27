import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const useAdminAuth = () => {
  try {
    // pega as infos basicas salvas no localStorage
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    // confere se o usuario tem permissao de admin
    if (role === 'admin' && token) {
      return true;
    }
    return false;
  } catch (e) {
    // só loga caso algo de errado na leitura
    console.error("Erro ao ler auth do localStorage", e);
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  const isAdmin = useAdminAuth();
  const location = useLocation();

  if (!isAdmin) {
    // redireciona para login e guarda de onde veio
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;