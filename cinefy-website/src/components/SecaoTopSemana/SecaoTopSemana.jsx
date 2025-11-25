import React from 'react';
import CardTopSemana from '../CardTopSemana/CardTopSemana';
import { useNavigate } from "react-router-dom";
import './SecaoTopSemana.css'; 
/**
 * * @param {string} tituloSecao 
 * @param {array} listaFilmes 
 */
function SecaoTopSemana({ tituloSecao, listaFilmes = [], favoritos, toggleFavorito }) { 
 
    const navigate = useNavigate();
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
                    <CardTopSemana
                        key={filme.id} 
                        titulo={filme.titulo}
                        genero={filme.generos || 'Ação | Drama'} 
                        posterCapa={filme.poster}
                        toggleFavorito={toggleFavorito}
                        favoritos={favoritos}
                        onClick={() => navigate(`/detalhes/${filme.id}`)} 
                    />
                ))}
            </div>
        </section>
    );
}

export default SecaoTopSemana;