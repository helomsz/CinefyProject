import React from 'react';
import { Play } from 'lucide-react';
import './CardCarrossel.css';
function CardCarrossel({ filme, className, onCardClick }) {
    const { titulo, descricao, capaFundo } = filme;

    return (
        <div 
            className={`cardCarrossel ${className}`} 
            style={{ backgroundImage: `url(${capaFundo})` }}
            onClick={onCardClick} 
        >
            <div className="cardConteudo">
                <h2 className="cardTitulo">{titulo}</h2>
                <p className="cardDescricao">{descricao}</p>
                <button className="botaoAssistir">
                    <Play size={20} fill="#f6f5f5ff" /> Assistir
                </button>
            </div>
        </div>
    );
}

export default CardCarrossel;