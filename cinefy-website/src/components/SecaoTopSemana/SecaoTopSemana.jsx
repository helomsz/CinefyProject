import React from 'react';
import CardTopSemana from '../CardTopSemana/CardTopSemana';
import './SecaoTopSemana.css'; 
/**
 * Componente dedicado à seção de Lançamentos, utilizando o layout de cards verticais.
 * Esta seção é ideal para exibir N cards em um grid fixo de 6 colunas.
 * * @param {string} tituloSecao - O título da seção (ex: "Lançamentos").
 * @param {array} listaFilmes - Lista dos objetos de filmes a serem exibidos.
 */
function SecaoTopSemana({ tituloSecao, listaFilmes = [], favoritos, toggleFavorito }) { 
    
    // Se a lista de filmes for vazia, não renderiza a seção
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
                    />
                ))}
            </div>
        </section>
    );
}

export default SecaoTopSemana;