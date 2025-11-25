import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LoadingPage from "../LoadingPage/LoadingPage";

const PageTransitionLoader = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [location.pathname]); 

  if (loading) {
    return <LoadingPage />;
  }

  return <>{children}</>;
};

export default PageTransitionLoader;
