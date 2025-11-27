import React from 'react';
import './BotaoLogin.css';

function BotaoLogin({ texto, tipo = 'button', onClick }) {  // recebendo as props do botão: texto, tipo (default 'button') e onClick
  return (
    <button 
      className="botaoLogin" 
      type={tipo} // define o tipo do botão
      onClick={onClick} // função que será chamada ao clicar no botão
    >
      {texto}
    </button>
  );
}

export default BotaoLogin;