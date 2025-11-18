import React from 'react';
import './BotaoPrimario.css';

function BotaoPrimario({ texto, tipo = 'button', onClick, ...props }) {
  return (
    <button 
      className="botaoPrimario" 
      type={tipo} 
      onClick={onClick}
      {...props}
    >
      {texto}
    </button>
  );
}


export default BotaoPrimario;