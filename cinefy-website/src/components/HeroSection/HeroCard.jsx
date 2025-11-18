// src/components/HeroSection/HeroCard.jsx

import React from 'react';
import { FaBookmark } from "react-icons/fa";

function HeroCard({ filme, isSelected, onClick }) {
    const { titulo, categoria, rating, imagemCapa } = filme;
    
    // Adiciona a classe 'selected' para o efeito de aumento
    const cardClass = `hero-card ${isSelected ? 'selected' : ''}`;

    return (
        <div className={cardClass} onClick={onClick}>
            {/* Botão de "Salvar" ou Bookmark no canto superior direito */}
            <FaBookmark  className="card-bookmark"/>
            
            <img src={imagemCapa} alt={titulo} className="cardImage" />
            
            <div className="card-info">
                <span className="card-category">{categoria}</span>
                <h3 className="card-title-home">{titulo}</h3>
                <div className="card-rating-hero">
                    {/* Renderiza as estrelas com base no 'rating' */}
                    {'★'.repeat(rating)}
                    {'☆'.repeat(5 - rating)}
                </div>
            </div>
        </div>
    );
}

export default HeroCard;