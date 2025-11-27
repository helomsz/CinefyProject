import React, { useEffect, useState } from "react";
import { FaHeart, FaPlay } from 'react-icons/fa';
import './CardFilmeVertical.css';

function CardFilmeVertical({ titulo, genero, status, posterCapa, onClick }) {
  const imagemCaminho = posterCapa || 'assets/images/placeholder.png';

  // define o caminho da imagem do filme
  const urlImagem = `http://localhost:8000/${imagemCaminho}`;

  // estado para controlar se o filme está favoritado ou não
  const [favoritado, setFavoritado] = useState(false);

  useEffect(() => {
    try {
      // tenta ler os filmes favoritos do localstorage
      const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");

      // filtra apenas os itens válidos
      const validos = Array.isArray(favs)
        ? favs.filter((f) => f && typeof f === "object" && f.titulo)
        : [];

      setFavoritado(validos.some((f) => f.titulo === titulo));

      // salva de volta os válidos
      localStorage.setItem("favoritos", JSON.stringify(validos));

    } catch (e) {
      // se houver erro ao ler os favoritos, reseta o armazenamento
      console.error("Erro ao ler favoritos:", e);
      localStorage.setItem("favoritos", "[]");
    }
  }, [titulo]);

  const toggleFavorito = (e) => {
    e.stopPropagation();
    const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");

    if (favoritado) {
      // se já estava favoritado, remove
      const novos = favs.filter((f) => f.titulo !== titulo);
      localStorage.setItem("favoritos", JSON.stringify(novos));
      setFavoritado(false);
    } else {
      // adiciona
      const novoFilme = { titulo, genero, posterCapa };
      localStorage.setItem("favoritos", JSON.stringify([...favs, novoFilme]));
      setFavoritado(true);
    }
  };

  return (
    <article
      className="cardFilmeVertical"
      style={{ '--background-url': `url(${urlImagem})` }}
      onClick={onClick}
    >
      <div className="imagemCapa">
        <div className="favoriteButtonContainer">
          {/* botão de favorito */}
          <button className="botaoFavorito" onClick={toggleFavorito}>
            <FaHeart
              alt="Ícone de favoritos"
              className={`heartIcon ${favoritado ? "ativo" : ""}`}
            />
          </button>
        </div>

        {/* botão de play*/}
        <div className="playButtonContainerVertical">
          <button className="botaoPlayVertical">
            <FaPlay className="iconePlay" fill="white" />
          </button>
        </div>

        {/* informações no rodapé do card */}
        <div className="informacoesRodape">
          <span className="statusFilme">{status || 'Novo'}</span>
          <div className="detalhesFilmeVertical">
            <h3 className="tituloFilmeVertical">{titulo}</h3>
            <p className="generoFilmeVertical">{genero}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default CardFilmeVertical;
