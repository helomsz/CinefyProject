import React, { useEffect, useState } from "react";
import './CardCatalogoKids.css';
import { FaHeart, FaPlay } from 'react-icons/fa';

function CardCatalogoKids({ titulo, genero, posterCapa, onClick}) { 
    const imagemCaminho = posterCapa || 'assets/images/placeholder.png';
    const urlImagem = `http://localhost:8000/${imagemCaminho}`;

    const [favoritado, setFavoritado] = useState(false);

    useEffect(() => {
        try {
            const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
            const validos = Array.isArray(favs)
                ? favs.filter((f) => f && typeof f === "object" && f.titulo)
                : [];
            setFavoritado(validos.some((f) => f.titulo === titulo));
            localStorage.setItem("favoritos", JSON.stringify(validos));
        } catch (e) {
            console.error("Erro ao ler favoritos:", e);
            localStorage.setItem("favoritos", "[]");
        }
    }, [titulo]);

    const toggleFavorito = (e) => {
        e.stopPropagation();
        const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");

        if (favoritado) {
            const novos = favs.filter((f) => f.titulo !== titulo);
            localStorage.setItem("favoritos", JSON.stringify(novos));
            setFavoritado(false);
        } else {
            const novoFilme = { titulo, genero, posterCapa };
            localStorage.setItem("favoritos", JSON.stringify([...favs, novoFilme]));
            setFavoritado(true);
        }
    };

    return (
        <article
            className="cardFilmeTop"
            style={{ '--background-url': `url(${urlImagem})` }}
            onClick={onClick}
        >
            <div className="imagemCapa">
                <div className="favoriteButtonContainer">
                    <button className="botaoFavorito" onClick={toggleFavorito}>
                        <FaHeart
                            alt="Ícone de favoritos"
                            className={`heartIcon ${favoritado ? "ativo" : ""}`}
                        />
                    </button>
                </div>

                <div className="playButtonContainerTop">
                    <button className="botaoPlayTop">
                        <FaPlay className="iconePlay" fill="white" />
                    </button>
                </div>

                <div className="informacoesRodapeTop">
                    <div className="detalhesFilmeVerticalTop">
                        <h3 className="tituloFilmeVerticalTop">{titulo}</h3>
                        <p className="generoFilmeVerticalTop">{genero}</p>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default CardCatalogoKids;
