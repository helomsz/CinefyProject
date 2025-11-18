import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './FavoritesHero.css';
import PhoneMockupComplete from '../../assets/favoritos/celular.png'; 

const FavoritesHero = () => {
    return (
        <section className="favorites-hero">
            <div className="hero-content-text">
                <p className="hero-subtitle">Bem-vindo à sua galeria cinematográfica pessoal.</p>
                <p className='titulo'>Sua coleção de filmes favoritos,</p>

                <p className="hero-description">
                    Adicione, organize e reviva seus momentos favoritos do cinema. Continue de onde parou ou descubra algo novo na sua lista.
                </p>
                
                {/* Botão de Ação */}
                <Link to="/catalogo">
                <button className="add-to-list-button">
                    Adicionar mais à minha lista 
                    <div className="iconeSetaWrapper">
                    <ArrowRight size={20} className="icone" />
                    </div>
                </button>
                </Link>
            </div>
            <div className="hero-image-container">
                <img 
                    src={PhoneMockupComplete}
                    alt="Mockup de celular com o aplicativo CineFy e cards de recomendação" 
                    className="phone-mockup-complete"
                />
            </div>
        </section>
    );
};

export default FavoritesHero;
