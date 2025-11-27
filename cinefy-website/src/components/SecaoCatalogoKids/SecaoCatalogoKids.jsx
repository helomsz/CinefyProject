import React, { forwardRef } from 'react';
import { useNavigate } from "react-router-dom";
import './SecaoCatalogoKids.css';
import CardCatalogoKids from '../CardCatalogoKids/CardCatalogoKids';

const SecaoCatalogoKids = forwardRef(({ filmesFiltrados }, ref) => {
    const navigate = useNavigate();

    // se a lista de filmes filtrados estiver vazia, retorna null (não exibe nada)
      if (filmesFiltrados.length === 0) {
        return null;
      }
    return (
        <section ref={ref} className="secaoFilmesWrapper">
            <div className="filmesGrid">
                {/* mapeia cada filme e exibe o Card de cada um */}
                {filmesFiltrados.map((filme) => (
                        <CardCatalogoKids
                            key={filme.id}
                            titulo={filme.titulo}
                            genero={filme.generos}
                            posterCapa={filme.poster}
                            onClick={() => navigate(`/detalhes/${filme.id}`)} // navega para tela de detalhes específicos do filme
                        />
                ))}
            </div>
        </section>
    );
});

export default SecaoCatalogoKids;
