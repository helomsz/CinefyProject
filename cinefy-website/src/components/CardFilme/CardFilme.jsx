import React, { useState } from 'react';
import './CardFilme.css';
import { FaPlay, FaStar, FaTimes } from 'react-icons/fa';

function CardFilme({ titulo, genero, nota, posterMini, trailer, onClick }) {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const imagemCaminho = posterMini || 'assets/images/placeholder.png';
    const urlImagem = `http://localhost:8000/${imagemCaminho}`;

    const youtubeEmbedUrl = trailer
        ? `https://www.youtube.com/embed/${trailer}?autoplay=1&rel=0`
        : null;

    const handleOpenModal = (e) => {
        e.stopPropagation();
        if (youtubeEmbedUrl) {
            setIsModalOpen(true);
        } else {
            console.warn(`Trailer indisponível para o filme: ${titulo}`);
        }
    };

    const handleCloseModal = (e) => {
        if (e) e.stopPropagation();
        setIsModalOpen(false);
    };

    return (
        <>
            <article className="cardFilme" onClick={onClick}>
                <div
                    className="imagemFilme"
                    style={{ backgroundImage: `url(${urlImagem})` }}
                >

                    <div className="playButtonContainer">
                        <button className="botaoPlay" onClick={handleOpenModal}>
                            <FaPlay className="playIcon" />
                        </button>
                    </div>

                    <div className="informacoesOverlay">
                        <div className="detalhesFilme">
                            <h3 className="tituloFilme">{titulo}</h3>
                            <p className="generoFilme">{genero}</p>
                        </div>

                        <div className="divisorVertical"></div>

                        <span className="notaFilme">
                            <FaStar className="starIcon" />
                            {String(nota)}
                        </span>
                    </div>

                </div>
            </article>

            {isModalOpen && youtubeEmbedUrl && (
                <div className="modalOverlay" onClick={handleCloseModal}>
                    <div className="modalContent" onClick={e => e.stopPropagation()}>

                        <div className="modalHeader">
                            <h4 className="modalTitle">
                                <span className="modalTitleLabel">Trailer</span>
                                <span className="modalTitleContent">{titulo}</span>
                            </h4>
                            <button className="modalCloseButton" onClick={handleCloseModal}>
                                <FaTimes />
                            </button>
                        </div>
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
