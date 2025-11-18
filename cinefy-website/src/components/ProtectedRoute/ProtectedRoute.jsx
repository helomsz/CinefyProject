import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Hook simples para verificar a autenticação do admin.
 * Retorna true se o 'role' for 'admin' e um 'token' existir.
 */
const useAdminAuth = () => {
  try {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    
    // A verificação é simples: precisa ter o role 'admin' E um token
    if (role === 'admin' && token) {
      return true;
    }
    return false;
  } catch (e) {
    console.error("Erro ao ler auth do localStorage", e);
    return false;
  }
};
/**
 * Este componente "envolve" uma rota.
 * Se o usuário for admin, renderiza o componente filho (children).
 * Se não for, redireciona para a página /login.
 */
const ProtectedRoute = ({ children }) => {
  const isAdmin = useAdminAuth();
  const location = useLocation();

  if (!isAdmin) {
    // Se não for admin, redireciona para /login
    // 'state={{ from: location }}' é um bônus: guarda a página que o usuário
    // tentou acessar, para que ele possa ser redirecionado de volta
    // após o login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se for admin, apenas renderiza o componente que ele tentou acessar
  // (no seu caso, o <AdminDashboard />)
  return children;
};

export default ProtectedRoute;