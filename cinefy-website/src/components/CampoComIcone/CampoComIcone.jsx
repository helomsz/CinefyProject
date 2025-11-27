import React, { useState } from 'react';
import './CampoComIcone.css';
import { EyeOffIcon } from 'lucide-react'; 

function CampoComIcone({ nome, placeholder, valor, aoMudar, tipo, Icone }) { // desestruturando as props
  const [tipoAtual, setTipoAtual] = useState(tipo);
  
   // função para alternar entre os tipos 'password' e 'text' ao clicar no ícone
  const toggleVisibilidade = () => {
    if (tipo === 'password') { // só permite alternar se o tipo for 'password'
      setTipoAtual(prevTipo => (prevTipo === 'password' ? 'text' : 'password'));  // alterna entre 'password' e 'text'
    }
  };

  return (
    <div className="campoInputContainer"> 
      <div className="campoInputWrapper">
        <input
          type={tipoAtual}
          name={nome}
          className="campoInput"
          placeholder={placeholder}
          value={valor}
          onChange={aoMudar}
        />
        
        {tipo === 'password' && ( // renderiza o ícone apenas se o tipo for 'password'
          <div className="iconeVisibilidade" onClick={toggleVisibilidade}>
            {/* ícone que altera a visibilidade */}
            {tipoAtual === 'text' ? ( // se o tipo atual for 'text', mostra o ícone de olho fechado
              <EyeOffIcon size={20} color="#A0A0A0" />
            ) : (
              <Icone size={20} color="#A0A0A0" /> // caso contrário, renderiza o ícone
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CampoComIcone;
