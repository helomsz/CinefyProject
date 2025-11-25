
import React from 'react';
import { FaBookmark } from "react-icons/fa";

function HeroCard({ filme, isSelected, onClick }) {
    const { titulo, categoria, rating, imagemCapa } = filme;

    const cardClass = `hero-card ${isSelected ? 'selected' : ''}`;

    return (
        <div className={cardClass} onClick={onClick}>
            <FaBookmark  className="card-bookmark"/>
            
            <img src={imagemCapa} alt={titulo} className="cardImage" />
            
            <div className="card-info">
                <span className="card-category">{categoria}</span>
                <h3 className="card-title-home">{titulo}</h3>
                <div className="card-rating-hero">
                    {'★'.repeat(rating)}
                    {'☆'.repeat(5 - rating)}
                </div>
            </div>
        </div>
    );
}

export default HeroCard;