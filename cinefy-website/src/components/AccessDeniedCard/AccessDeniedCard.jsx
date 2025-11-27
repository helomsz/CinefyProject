
import React from "react";
import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import './AcessDeniedCard.css'

const AccessDeniedCard = () => {
  // hook que permite redirecionar o usuário
  const navigate = useNavigate();

  return (

    <div className="centered-message-container"> {/* container pra centralizar a mensagem na tela */}
      <div className="access-denied-card">
        <Zap size={48} className="icon-denied" />
        <h1 className="denied-title">Acesso Negado</h1>
        <p className="denied-message">
          Você precisa estar logado para acessar esta página.
        </p>
        <button
          onClick={() => navigate("/login")} 
          className="denied-login-button"
        >
          Ir para Login
        </button>
      </div>
    </div>
  );
};

export default AccessDeniedCard;