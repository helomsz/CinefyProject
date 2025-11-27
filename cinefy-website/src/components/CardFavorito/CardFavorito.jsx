import React from 'react';
import { useNavigate } from 'react-router-dom';
import MeninaSentada from '../../assets/favoritos/meninapretinha.png'; 
import './CardFavorito.css';

const CardAdicaoFilme = () => {
    const navigate = useNavigate();  // hook para navegação

     // função para navegar até a tela de adição de filme
    const irParaTelaDeAdicao  = () => navigate('/adicionar');


    return (
        <div className="card-adicao-filme">
            <div className="card-adicao-content">
                <h2>Personalize sua experiência</h2>
                <p>adicione filmes e crie sua própria coleção.</p>
                <button className="add-movie-btn" onClick={irParaTelaDeAdicao}>
                    Adicionar novo filme<span className="seta">→</span>
                </button>
            </div>
            <div className="card-adicao-image">
                {/* imagem ilustrativa do card */}
                <img src={MeninaSentada}
                    alt="Menina preta sentada vendo tv"  />
            </div>
        </div>
    );
};

export default CardAdicaoFilme;
