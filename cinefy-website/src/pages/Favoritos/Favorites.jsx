    import React, { useState, useEffect } from 'react';
    import FavoritesHero from '../../components/FavoritesHero/FavoritesHero'; 
    import './Favorites.css';

    import MenuLateral from '../../components/MenuLateral/MenuLateral';
    import NavbarCentralizada from '../../components/NavbarCentralizada/NavbarCentralizada'; 
    import Footer from '../../components/Footer/Footer'; 
    import LoadingPage from '../../components/LoadingPage/LoadingPage'; 
    import CardTopSemana from '../../components/CardTopSemana/CardTopSemana';
    import SecaoCarrosselRecomendacoes from '../../components/CardHorizontalRecomendacao/CardHorizontalRecomendacao'; 
    import CardAdicaoFilme from '../../components/CardFavorito/CardFavorito';


    const API_RECOMENDACOES_URL = 'http://localhost:8000/listar_filmes'; 


    const Favorites = () => {
        const [isLoading, setIsLoading] = useState(true);
        const [favoritos, setFavoritos] = useState([]);
        

        const [recomendacoes, setRecomendacoes] = useState([]); 
        const [loadingRecomendacoes, setLoadingRecomendacoes] = useState(true);

        // carrega a lista de favoritos do LocalStorage
        useEffect(() => {
            try {
                const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
                setFavoritos(favs);
            } catch (error) {
                console.error("Erro ao carregar favoritos do localStorage:", error);
            }
        }, []);

        useEffect(() => {
            const fetchRecomendacoes = async () => {
                try {
                    const response = await fetch(API_RECOMENDACOES_URL);
                    if (!response.ok) {
                        throw new Error(`Erro HTTP: ${response.status}`);
                    }
                    const data = await response.json();
                    setRecomendacoes(data);

                } catch (error) {
                    console.error("Erro ao carregar recomendações:", error);
                    setRecomendacoes([]); 
                } finally {
                    setLoadingRecomendacoes(false);
                }
            };
            if (API_RECOMENDACOES_URL) {
                fetchRecomendacoes();
            } else {
                setLoadingRecomendacoes(false);
            }
        }, [favoritos]); 
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

                        {loadingRecomendacoes ? (
                            <p style={{ color: 'white', padding: '0 60px 40px' }}>Carregando recomendações...</p>
                        ) : (
                            <SecaoCarrosselRecomendacoes 
                                filmes={recomendacoes} 
                                tituloSecao="Recomendado para Você"
                            />
                        )}
                        <CardAdicaoFilme/>

                        <Footer />
                       
                    </main>
                </div>
            </div>
        );
    };

    export default Favorites;