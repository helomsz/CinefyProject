import React, { useState, useEffect } from 'react';
import FavoritesHero from '../../components/FavoritesHero/FavoritesHero'; 
import './Favorites.css';

import MenuLateral from '../../components/MenuLateral/MenuLateral';
import NavbarCentralizada from '../../components/NavbarCentralizada/NavbarCentralizada'; 
import Footer from '../../components/Footer/Footer'; 
import LoadingPage from '../../components/LoadingPage/LoadingPage'; 
import CardTopSemana from '../../components/CardTopSemana/CardTopSemana';
// Importação correta do seu carrossel
import SecaoCarrosselRecomendacoes from '../../components/CardHorizontalRecomendacao/CardHorizontalRecomendacao'; 

// URL de Exemplo: Adapte para a sua API real de backend
const API_RECOMENDACOES_URL = 'http://localhost:8000/listar_filmes'; 


const Favorites = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [favoritos, setFavoritos] = useState([]);
    
    // NOVO ESTADO: Para armazenar a lista de filmes recomendados
    const [recomendacoes, setRecomendacoes] = useState([]); 
    const [loadingRecomendacoes, setLoadingRecomendacoes] = useState(true);

    // EFEITO 1: Carrega a lista de favoritos do LocalStorage
    useEffect(() => {
        try {
            const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
            setFavoritos(favs);
        } catch (error) {
            console.error("Erro ao carregar favoritos do localStorage:", error);
        }
    }, []);

    // EFEITO 2: Faz a chamada da API para carregar as recomendações
    useEffect(() => {
        const fetchRecomendacoes = async () => {
            try {
                // Simulação de como você passaria IDs de favoritos se a API precisasse deles
                // const idsFavoritos = favoritos.map(f => f.id).join(',');
                // const url = `${API_RECOMENDACOES_URL}?fav_ids=${idsFavoritos}`;

                const response = await fetch(API_RECOMENDACOES_URL);
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const data = await response.json();
                
                // Assumindo que a API retorna um array de filmes (Ex: [{id: 1, titulo: "...", ...}])
                setRecomendacoes(data);

            } catch (error) {
                console.error("Erro ao carregar recomendações:", error);
                // Você pode definir recomendações como [] ou exibir uma mensagem de erro
                setRecomendacoes([]); 
            } finally {
                setLoadingRecomendacoes(false);
            }
        };

        // Só faz a busca se a API URL estiver definida e não estiver carregando a página
        if (API_RECOMENDACOES_URL) {
            fetchRecomendacoes();
        } else {
            setLoadingRecomendacoes(false); // Se não tiver URL, assume que não há recomendações
        }
    }, [favoritos]); // Você pode depender de 'favoritos' se a busca precisar deles

    // EFEITO 3: Simulação de carregamento da página principal
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

                    {/* RENDERIZAÇÃO CONDICIONAL DA SEÇÃO DE RECOMENDAÇÕES */}
                    {loadingRecomendacoes ? (
                        <p style={{ color: 'white', padding: '0 60px 40px' }}>Carregando recomendações...</p>
                    ) : (
                        <SecaoCarrosselRecomendacoes 
                            filmes={recomendacoes} 
                            tituloSecao="Recomendado para Você"
                        />
                    )}

                    <Footer />
                    
                </main>
            </div>
        </div>
    );
};

export default Favorites;