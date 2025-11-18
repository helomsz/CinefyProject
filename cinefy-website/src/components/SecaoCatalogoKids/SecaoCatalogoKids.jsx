import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom'; // ⭐ IMPORT NECESSÁRIO
import './SecaoCatalogoKids.css';
import CardCatalogoKids from '../CardCatalogoKids/CardCatalogoKids';

const SecaoCatalogoKids = forwardRef(({ filmesFiltrados }, ref) => {
    return (
        <section ref={ref} className="secaoFilmesWrapper">
            <div className="filmesGrid">
                {filmesFiltrados.map((filme) => (
                    <Link
                        key={filme.id}
                        to={`/detalhes/${filme.id}`}
                        className="filme-card-link"
                    >
                        <CardCatalogoKids
                            key={filme.id}
                            titulo={filme.titulo}
                            genero={filme.generos}
                            posterCapa={filme.poster}
                        />
                    </Link>
                ))}
            </div>
        </section>
    );
});

export default SecaoCatalogoKids;
