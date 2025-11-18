import React, { useState, useEffect } from 'react';
import FavoritesHero from '../../components/FavoritesHero/FavoritesHero'; 
import './Favorites.css';

import MenuLateral from '../../components/MenuLateral/MenuLateral';
import NavbarCentralizada from '../../components/NavbarCentralizada/NavbarCentralizada'; 
import Footer from '../../components/Footer/Footer'; 
import LoadingPage from '../../components/LoadingPage/LoadingPage'; 
import CardTopSemana from '../../components/CardTopSemana/CardTopSemana';
import SecaoCarrosselRecomendacoes from '../../components/CardHorizontalRecomendacao/CardHorizontalRecomendacao';




const Favorites = () => {
    const [isLoading, setIsLoading] = useState(true);

    const [favoritos, setFavoritos] = useState([]);
 
        useEffect(() => {
            const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
            setFavoritos(favs);
        }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);


    if (isLoading) {
        return <LoadingPage />; 
    }

    return (
        <div className="favorites-page-container"> 
            <MenuLateral />
            
            <div className="main-content-wrapper">
                <NavbarCentralizada />
                
                <main className="favorites-main">
                    <FavoritesHero />

                    <div className="containerFavoritos">
                    <h2>Meus Favoritos</h2>
                    {favoritos.length === 0 ? (
                        <p>Nenhum filme foi favoritado ainda.</p>
                    ) : (
                        <div className="listaFavoritos">
                        {favoritos.map((filme) => (
                            <CardTopSemana key={filme.id} {...filme} />
                        ))}
                        </div>
                    )}
                    </div>

                    <SecaoCarrosselRecomendacoes />
                    <Footer />
                    
                </main>
                 

                
            </div>
        </div>
    );
};

export default Favorites;