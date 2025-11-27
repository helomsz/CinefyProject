import React from 'react';
import CardTopSemana from '../CardTopSemana/CardTopSemana';
import { useNavigate } from "react-router-dom";
import './SecaoTopSemana.css'; 
/**
 * * @param {string} tituloSecao 
 * @param {array} listaFilmes 
 */
function SecaoTopSemana({ tituloSecao, listaFilmes = [], favoritos, toggleFavorito }) { 
 
    // hook para navegar entre páginas do React Router
    const navigate = useNavigate();

    // verifica se a lista de filmes está vazia, caso esteja, retorna null e não renderiza a seção
    if (listaFilmes.length === 0) {
        return null;
    }

    return (
        <section className="secaoTop">
            <header className="cabecalhoSecaoTop">
                <h2 className="tituloSecaoTop">{tituloSecao}</h2>
            </header>
            
            <div className="containerCardsTop">
                {listaFilmes.map((filme) => (
                    // mapeia a lista de filmes e renderiza um CardTopSemana para cada filme
                    <CardTopSemana
                        key={filme.id} 
                        titulo={filme.titulo}
                        genero={filme.generos || 'Ação | Drama'} 
                        posterCapa={filme.poster}
                        toggleFavorito={toggleFavorito}
                        favoritos={favoritos}
                        onClick={() => navigate(`/detalhes/${filme.id}`)}  // vai para tela de detalhes do filme
                    />
                ))}
            </div>
        </section>
    );
}

export default SecaoTopSemana;