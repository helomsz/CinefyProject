import React, { useState } from 'react';
import './CampoComIcone.css';
import { EyeOffIcon } from 'lucide-react'; 

function CampoComIcone({ nome, placeholder, valor, aoMudar, tipo, Icone }) {
  const [tipoAtual, setTipoAtual] = useState(tipo);
  
  const toggleVisibilidade = () => {
    if (tipo === 'password') {
      setTipoAtual(prevTipo => (prevTipo === 'password' ? 'text' : 'password'));
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
        
        {tipo === 'password' && (
          <div className="iconeVisibilidade" onClick={toggleVisibilidade}>
            {tipoAtual === 'text' ? (
              <EyeOffIcon size={20} color="#A0A0A0" />
            ) : (
              <Icone size={20} color="#A0A0A0" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CampoComIcone;
