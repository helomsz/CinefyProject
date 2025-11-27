import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LoadingPage from "../LoadingPage/LoadingPage";

const PageTransitionLoader = ({ children }) => {
  const location = useLocation();
  // controla se a tela de loading deve aparecer
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ativa o loading quando o pathname muda
    setLoading(true);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000); // delay pra deixar a transição mais suave

    return () => clearTimeout(timeout); // limpa pra evitar vazamento de memória
  }, [location.pathname]); 

  if (loading) {
    // renderiza o componente de loading antes da nova página
    return <LoadingPage />;
  }

  // mostra o conteúdo quando o loading termina
  return <>{children}</>;
};

export default PageTransitionLoader;
