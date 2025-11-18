import React from 'react';
import './BotaoLogin.css';

function BotaoLogin({ texto, tipo = 'button', onClick }) {
  return (
    <button 
      className="botaoLogin" 
      type={tipo} 
      onClick={onClick}
    >
      {texto}
    </button>
  );
}

export default BotaoLogin;