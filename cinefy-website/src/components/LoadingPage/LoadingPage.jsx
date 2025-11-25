import React, { useEffect, useState } from 'react';
import './LoadingPage.css';
import { FaSpinner } from 'react-icons/fa';
import logoCinefy from '../../assets/icones/LOGO.svg'; 

function LoadingPage() {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`loadingPageContainer ${fadeIn ? 'fadeIn' : ''}`}>
      <div className="loadingContent">
        <img src={logoCinefy} alt="Logo Cinefy" className="loadingLogoImg" />

        <h1 className="loadingLogo">CINE<i>FY</i></h1>
        <p className="loadingMessage">Carregando a experiência do cinema...</p>

        <div className="loadingSpinnerWrapper">
          <FaSpinner className="loadingSpinner" />
        </div>
      </div>
    </div>
  );
}

export default LoadingPage;
