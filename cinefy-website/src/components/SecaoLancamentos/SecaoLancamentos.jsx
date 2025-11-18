import React from "react";
import CardFilmeVertical from "../CardFilmeVertical/CardFilmeVertical.jsx";
import { Link } from "react-router-dom";
import "./SecaoLancamentos.css"; // Novo CSS para este layout

/**
 * Componente dedicado à seção de Lançamentos, utilizando o layout de cards verticais.
 * Esta seção é ideal para exibir N cards em um grid fixo de 6 colunas.
 * * @param {string} tituloSecao - O título da seção (ex: "Lançamentos").
 * @param {array} listaFilmes - Lista dos objetos de filmes a serem exibidos.
 */
function SecaoLancamentos({
  tituloSecao,
  listaFilmes = [],
  favoritos,
  toggleFavorito,
}) {
  // Se a lista de filmes for vazia, não renderiza a seção
  if (listaFilmes.length === 0) {
    return null;
  }

  return (
    <section className="secaoLancamentos">
      <header className="cabecalhoSecaoLancamentos">
        <h2 className="tituloSecaoLancamentos">{tituloSecao}</h2>
      </header>

      <div className="containerCardsLancamento">
        {listaFilmes.map((filme) => (
          <Link
            key={filme.id}
            to={`/detalhes/${filme.id}`}
            className="filme-card-link"
          >
            <CardFilmeVertical
              key={filme.id}
              titulo={filme.titulo}
              genero={filme.generos || "Ação | Drama"} // Usando um pipe | para o gênero
              status={filme.status || "Novo"}
              posterCapa={filme.poster}
              toggleFavorito={toggleFavorito}
              favoritos={favoritos}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default SecaoLancamentos;
