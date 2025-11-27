import React, { useEffect, useState } from 'react';
import './LoadingPage.css';
import { FaSpinner } from 'react-icons/fa';
import logoCinefy from '../../assets/icones/LOGO.svg'; 

function LoadingPage() {
  // estado simples pra controlar a animação de fade-in
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // pequeno delay pra deixar a transição mais suave
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer); // limpa só por segurança
  }, []);

  return (
    <div className={`loadingPageContainer ${fadeIn ? 'fadeIn' : ''}`}>
      <div className="loadingContent">
        {/* logo principal da tela de loading */}
        <img src={logoCinefy} alt="Logo Cinefy" className="loadingLogoImg" />

      {/* título estilizado do site */}
        <h1 className="loadingLogo">CINE<i>FY</i></h1>
        <p className="loadingMessage">Carregando a experiência do cinema...</p>

        <div className="loadingSpinnerWrapper">
          {/* ícone do spinner girando */}
          <FaSpinner className="loadingSpinner" />
        </div>
      </div>
    </div>
  );
}

export default LoadingPage;
