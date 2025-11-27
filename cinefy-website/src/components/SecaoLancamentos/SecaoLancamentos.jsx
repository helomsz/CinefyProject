
import React from "react";
import CardFilmeVertical from "../CardFilmeVertical/CardFilmeVertical.jsx";
import { useNavigate } from "react-router-dom";
import "./SecaoLancamentos.css";

function SecaoLancamentos({
  tituloSecao,
  listaFilmes = [],
  favoritos,
  toggleFavorito,
}) {
  const navigate = useNavigate(); // hook de navegação do React Router
  if (listaFilmes.length === 0) { // se não houver filmes para exibir, retorna null (não exibe nada)
    return null;
  }

  return (
    <section className="secaoLancamentos">
      <header className="cabecalhoSecaoLancamentos">
        <h2 className="tituloSecaoLancamentos">{tituloSecao}</h2>
      </header>

      <div className="containerCardsLancamento">
        {listaFilmes.map((filme) => (
          // mapeia os filmes e cria um card para cada um
          <CardFilmeVertical
            key={filme.id}
            titulo={filme.titulo}
            genero={filme.generos || "Ação | Drama"}
            status={filme.status || "Novo"}
            posterCapa={filme.poster}
            toggleFavorito={toggleFavorito}
            favoritos={favoritos}
            onClick={() => navigate(`/detalhes/${filme.id}`)} // navega para a página de detalhes do filme ao clicar
          />
        ))}
      </div>
    </section>
  );
}

export default SecaoLancamentos;
