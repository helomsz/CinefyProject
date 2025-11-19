import React, { useState } from 'react';
import './CardFilme.css';
import { FaPlay, FaStar, FaTimes } from 'react-icons/fa';

// Adicionei a prop 'onClick' aqui
function CardFilme({ titulo, genero, nota, posterMini, trailer, onClick }) {

    // Estado para controlar a visibilidade do modal do trailer
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Constrói a URL completa da imagem
    const imagemCaminho = posterMini || 'assets/images/placeholder.png';
    const urlImagem = `http://localhost:8000/${imagemCaminho}`;

    // Constrói a URL de incorporação (embed) do YouTube
    const youtubeEmbedUrl = trailer
        ? `https://www.youtube.com/embed/${trailer}?autoplay=1&rel=0`
        : null;

    const handleOpenModal = (e) => {
        // ESSENCIAL: Impede que o clique suba e acione o onClick do Card
        e.stopPropagation();
        if (youtubeEmbedUrl) {
            setIsModalOpen(true);
        } else {
            console.warn(`Trailer indisponível para o filme: ${titulo}`);
        }
    };

    const handleCloseModal = (e) => {
        if (e) e.stopPropagation(); // Evita propagação, embora o modal já esteja tratando
        // Para parar o vídeo ao fechar
        setIsModalOpen(false);
    };

    return (
        <>
            {/* Aplicado o onClick aqui para a navegação do card */}
            <article className="cardFilme" onClick={onClick}>
                <div
                    className="imagemFilme"
                    style={{ backgroundImage: `url(${urlImagem})` }}
                >

                    <div className="playButtonContainer">
                        {/* Botão de Play que abre o modal */}
                        {/* Adicionei 'e.stopPropagation()' dentro da função, mas o handleOpenModal já faz isso */}
                        <button className="botaoPlay" onClick={handleOpenModal}>
                            <FaPlay className="playIcon" />
                        </button>
                    </div>

                    <div className="informacoesOverlay">
                        <div className="detalhesFilme">
                            <h3 className="tituloFilme">{titulo}</h3>
                            <p className="generoFilme">{genero}</p>
                        </div>

                        {/* Divisor vertical */}
                        <div className="divisorVertical"></div>

                        <span className="notaFilme">
                            <FaStar className="starIcon" />
                            {/* Garante que o número tenha sempre uma casa decimal */}
                            {String(nota)}
                        </span>
                    </div>

                </div>
            </article>

            {/* --- MODAL DO TRAILER (Estrutura) --- */}
            {isModalOpen && youtubeEmbedUrl && (
                <div className="modalOverlay" onClick={handleCloseModal}>
                    <div className="modalContent" onClick={e => e.stopPropagation()}>

                        {/* NOVO: Cabeçalho verde/azul-petróleo */}
                        <div className="modalHeader">
                            {/* Assumindo que você tem o ano: {titulo} | {ano} */}
                            <h4 className="modalTitle">
                                <span className="modalTitleLabel">Trailer</span>
                                <span className="modalTitleContent">{titulo}</span>
                            </h4>

                            {/* Botão de fechar (movido para o header) */}
                            <button className="modalCloseButton" onClick={handleCloseModal}>
                                <FaTimes />
                            </button>
                        </div>
                        {/* FIM: NOVO HEADER */}

                        {/* Iframe do YouTube */}
                        <div className="iframeContainer">
                            <iframe
                                src={youtubeEmbedUrl}
                                title={`${titulo} Trailer`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}

export default CardFilme;
