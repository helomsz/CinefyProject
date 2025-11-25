import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const useAdminAuth = () => {
  try {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    if (role === 'admin' && token) {
      return true;
    }
    return false;
  } catch (e) {
    console.error("Erro ao ler auth do localStorage", e);
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  const isAdmin = useAdminAuth();
  const location = useLocation();

  if (!isAdmin) {

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;