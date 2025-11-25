
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
  const navigate = useNavigate();
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
          <CardFilmeVertical
            key={filme.id}
            titulo={filme.titulo}
            genero={filme.generos || "Ação | Drama"}
            status={filme.status || "Novo"}
            posterCapa={filme.poster}
            toggleFavorito={toggleFavorito}
            favoritos={favoritos}
            onClick={() => navigate(`/detalhes/${filme.id}`)} 
          />
        ))}
      </div>
    </section>
  );
}

export default SecaoLancamentos;
