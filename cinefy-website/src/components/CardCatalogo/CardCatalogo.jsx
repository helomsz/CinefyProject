import React from 'react';
import './CardCatalogo.css';

function CardCatalogo({ filme }) {
    const { titulo, subtitulo, poster_capa, popular } = filme;

    return (
        <div 
            className="cardCatalogoWrapper"
            style={{
                '--poster-capa': `url(${poster_capa})`,
            }}
        >
            {/* Selo de Popularidade */}
            {popular && (
                <div className="cardCatalogoSelo">
                    POPULAR
                </div>
            )}

            {/* Conteúdo */}
            <div className="cardCatalogoConteudo">
                <h2 className="cardCatalogoTitulo">{titulo}</h2>
                <p className="cardCatalogoSubtitulo">{subtitulo}</p>
            </div>
        </div>
    );
}

export default CardCatalogo;
