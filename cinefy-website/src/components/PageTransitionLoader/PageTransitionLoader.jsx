// src/components/PageTransitionLoader/PageTransitionLoader.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LoadingPage from "../LoadingPage/LoadingPage";

const PageTransitionLoader = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    // ⏳ simula um pequeno delay de transição
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [location.pathname]); // dispara toda vez que a rota muda

  if (loading) {
    return <LoadingPage />;
  }

  return <>{children}</>;
};

export default PageTransitionLoader;
