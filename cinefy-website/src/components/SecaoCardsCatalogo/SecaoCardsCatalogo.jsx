import React from 'react';
import CardCatalogo from '../CardCatalogo/CardCatalogo';
import './SecaoCardsCatalogo.css';

function SecaoCardsCatalogo({ titulo, filmes }) {
    if (!filmes || filmes.length === 0) {
        return null; 
    }

    return (
        <section className="secaoConteudoWrapper">
            <h2 className="secaoConteudoTitulo">{titulo}</h2>
            <div className="secaoConteudoCarrossel">
                {filmes.map((filme) => (
                    <CardCatalogo 
                        key={filme.id}
                        filme={filme} 
                    />
                ))}
            </div>
        </section>
    );
}

export default SecaoCardsCatalogo;