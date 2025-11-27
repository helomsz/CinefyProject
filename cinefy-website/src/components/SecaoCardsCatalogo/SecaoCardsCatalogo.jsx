import React from 'react';
import CardCatalogo from '../CardCatalogo/CardCatalogo';
import './SecaoCardsCatalogo.css';


function SecaoCardsCatalogo({ titulo, filmes }) {
    // verifica se a lista de filmes é válida e não está vazia
    if (!filmes || filmes.length === 0) {
        // se não houver filmes, o componente não renderiza nada
        return null; 
    }

    return (
        <section className="secaoConteudoWrapper">
            {/* titulo da seção */}
            <h2 className="secaoConteudoTitulo">{titulo}</h2>
            <div className="secaoConteudoCarrossel">
                {filmes.map((filme) => (
                    <CardCatalogo 
                        key={filme.id} // chave única para cada item da lista
                        filme={filme} 
                    />
                ))}
            </div>
        </section>
    );
}

export default SecaoCardsCatalogo;