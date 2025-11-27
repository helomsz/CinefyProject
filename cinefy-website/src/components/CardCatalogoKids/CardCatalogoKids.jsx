import React, { useEffect, useState } from "react";
import './CardCatalogoKids.css';
import { FaHeart, FaPlay } from 'react-icons/fa';

function CardCatalogoKids({ titulo, genero, posterCapa, onClick}) { 
    // definindo o caminho da imagem, com fallback para uma imagem padrão 
    const imagemCaminho = posterCapa || 'assets/images/placeholder.png';
    const urlImagem = `http://localhost:8000/${imagemCaminho}`;

    // estado para controlar se o filme está ou não favoritado
    const [favoritado, setFavoritado] = useState(false);


    // useEffect para carregar os favoritos do localstorage e verificar se o filme está favoritado
    useEffect(() => {
        try {
            const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
            const validos = Array.isArray(favs)
                ? favs.filter((f) => f && typeof f === "object" && f.titulo)
                : [];

            // verifica se o filme está nos favoritos    
            setFavoritado(validos.some((f) => f.titulo === titulo));

            // atualiza os favoritos no localstorage
            localStorage.setItem("favoritos", JSON.stringify(validos));
        } catch (e) {
            // se houver erro ao acessar o localstorage, limpa os favoritos
            console.error("Erro ao ler favoritos:", e);
            localStorage.setItem("favoritos", "[]");
        }
    }, [titulo]);

    // função para adicionar ou remover o filme dos favoritos    
    const toggleFavorito = (e) => {
        e.stopPropagation();
        const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");

        if (favoritado) {
            const novos = favs.filter((f) => f.titulo !== titulo);
            localStorage.setItem("favoritos", JSON.stringify(novos));
            setFavoritado(false);
        } else {
            // se não estiver favoritado, adiciona ao localstorage
            const novoFilme = { titulo, genero, posterCapa };
            localStorage.setItem("favoritos", JSON.stringify([...favs, novoFilme]));
            setFavoritado(true); // atualiza o estado para "favoritado"
        }
    };

    return (
        <article
            className="cardFilmeTop"
            style={{ '--background-url': `url(${urlImagem})` }} // define o fundo do card 
            onClick={onClick}
        >
            <div className="imagemCapa">
                {/* botão de favoritos */}
                <div className="favoriteButtonContainer">
                    <button className="botaoFavorito" onClick={toggleFavorito}>
                        <FaHeart
                            alt="Ícone de favoritos"
                            className={`heartIcon ${favoritado ? "ativo" : ""}`}
                        />
                    </button>
                </div>

                {/* botão de play */}
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
