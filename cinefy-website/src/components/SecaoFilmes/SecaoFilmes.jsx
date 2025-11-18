import React from 'react';
import { Link } from 'react-router-dom';
import CardFilme from '../CardFilme/CardFilme.jsx'; 
import CardFilmeVertical from '../CardFilmeVertical/CardFilmeVertical.jsx'; 
import './SecaoFilmes.css'; 
import { FaChevronRight } from 'react-icons/fa';
import ScrollRevealContainer from '../ScrollRevealContainer/ScrollRevealContainer.jsx';

function SecaoFilmes({ tituloSecao, listaFilmes = [] }) { 
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
                    <Link 
                        key={filme.id} 
                        to={`/detalhes/${filme.id}`} 
                        className="filme-card-link"
                    >
                        <CardFilme
                            titulo={filme.titulo}
                            genero={filme.generos || 'Gênero Desconhecido'} 
                            nota={filme.avaliacao_media || 0.0} 
                            posterMini={filme.poster_mini}
                            trailer={filme.trailer} 
                        />
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default SecaoFilmes;
