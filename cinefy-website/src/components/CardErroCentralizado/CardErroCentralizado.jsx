import React from 'react';
import { AlertTriangle } from 'lucide-react'; 
import './CardErroCentralizado.css';

function CardErroCentralizado({ mensagemErro }) {
    // o componente recebe uma prop 'mensagemErro' para exibir a mensagem dinâmica
    return (
        <div className="erro-container-full">
            {/* card que exibe a mensagem de erro */}
            <div className="erro-card">
                <AlertTriangle size={59} className="erro-icon" />
                <h2 className="erro-titulo">Falha ao Carregar Dados</h2>
                <p className="erro-mensagem">
                    {mensagemErro}
                </p>
                <div className="erro-detalhes">
                    <p>Verifique o servidor Python (`localhost:8000`) e a conexão com o banco de dados.</p>
                </div>
            </div>
        </div>
    );
}

export default CardErroCentralizado;