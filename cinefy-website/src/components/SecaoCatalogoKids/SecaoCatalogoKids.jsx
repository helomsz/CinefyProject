import React, { forwardRef } from 'react';
import { useNavigate } from "react-router-dom";
import './SecaoCatalogoKids.css';
import CardCatalogoKids from '../CardCatalogoKids/CardCatalogoKids';

const SecaoCatalogoKids = forwardRef(({ filmesFiltrados }, ref) => {
    const navigate = useNavigate();
      if (filmesFiltrados.length === 0) {
        return null;
      }
    return (
        <section ref={ref} className="secaoFilmesWrapper">
            <div className="filmesGrid">
                {filmesFiltrados.map((filme) => (
                        <CardCatalogoKids
                            key={filme.id}
                            titulo={filme.titulo}
                            genero={filme.generos}
                            posterCapa={filme.poster}
                            onClick={() => navigate(`/detalhes/${filme.id}`)}
                        />
                ))}
            </div>
        </section>
    );
});

export default SecaoCatalogoKids;
