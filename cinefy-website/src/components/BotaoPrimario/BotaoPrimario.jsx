import React from 'react';
import './BotaoPrimario.css';

function BotaoPrimario({ texto, tipo = 'button', onClick, ...props }) { // recebendo as props, incluindo texto, tipo (com valor default 'button'), onClick e outras props
  return (
    <button 
      className="botaoPrimario" 
      type={tipo}  // tipo do botão
      onClick={onClick}
      {...props} // espalha outras props recebidas no botão, como 'disabled', 'id', etc.
    >
      {texto}
    </button>
  );
}


export default BotaoPrimario;