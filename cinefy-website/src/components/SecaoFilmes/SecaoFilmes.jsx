import React from 'react';
import { useNavigate } from "react-router-dom";
import CardFilme from '../CardFilme/CardFilme.jsx'; 
import CardFilmeVertical from '../CardFilmeVertical/CardFilmeVertical.jsx'; 
import './SecaoFilmes.css'; 
import { FaChevronRight } from 'react-icons/fa';
import ScrollRevealContainer from '../ScrollRevealContainer/ScrollRevealContainer.jsx';

function SecaoFilmes({ tituloSecao, listaFilmes = [] }) {
    const navigate = useNavigate(); 
    if (listaFilmes.length === 0) {
        return null;
    }

    return (
        <section className="secaoFilmes">
            <header className="cabecalhoSecao">
                <h2 className="tituloSecao">{tituloSecao}</h2>
                <a href="/catalogo" className="linkVerTodos">
                    Ver Todos 
                    <FaChevronRight className="iconeSeta" size={14} />
                </a>
            </header>

            <div className="containerCards">
                {listaFilmes.map((filme) => (
                    <CardFilme
                        key={filme.id} 
                        titulo={filme.titulo}
                        genero={filme.generos || 'Gênero Desconhecido'} 
                        nota={filme.avaliacao_media || 0.0} 
                        posterMini={filme.poster_mini}
                        trailer={filme.trailer} 
                        onClick={() => navigate(`/detalhes/${filme.id}`)} 
                    />
                ))}
            </div>
        </section>
    );
}

export default SecaoFilmes;
