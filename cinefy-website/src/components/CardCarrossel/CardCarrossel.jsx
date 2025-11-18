import React, { useState } from 'react';
import ReactDOM from 'react-dom'; // 1. IMPORTAR ISSO
import { Play } from 'lucide-react';
import { FaTimes } from 'react-icons/fa';
import './CardCarrossel.css';

function CardCarrossel({ filme, className, onCardClick, trailer }) {
    const { titulo, descricao, capaFundo } = filme;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const youtubeEmbedUrl = trailer
        ? `https://www.youtube.com/embed/${trailer}?autoplay=1&rel=0`
        : null;

    const handleOpenModal = (e) => {
        e.stopPropagation();
        if (youtubeEmbedUrl) {
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Lógica do Modal separada para facilitar leitura
    const modalContent = (
        <div className="modalOverlayCarrossel" onClick={handleCloseModal}>
            <div className="modalContentCarrossel" onClick={(e) => e.stopPropagation()}>
                <div className="modalHeaderCarrossel">
                    <h4 className="modalTitle">
                        <span className="modalTitleLabel">Trailer</span>
                        <span className="modalTitleContent">{titulo}</span>
                    </h4>
                    <button className="modalCloseButton" onClick={handleCloseModal}>
                        <FaTimes />
                    </button>
                </div>
                <div className="iframeContainerCarrossel">
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
    );

    return (
        <>
            <div 
                className={`cardCarrossel ${className}`} 
                style={{ backgroundImage: `url(${capaFundo})` }}
                onClick={onCardClick} 
            >
                <div className="cardConteudo">
                    <h2 className="cardTitulo">{titulo}</h2>
                    <p className="cardDescricao">{descricao}</p>
                    <button className="botaoAssistir" onClick={handleOpenModal}>
                        <Play size={20} fill="#f6f5f5ff" /> Assistir
                    </button>
                </div>
            </div>

            {/* 2. USO DO PORTAL AQUI */}
            {isModalOpen && youtubeEmbedUrl && ReactDOM.createPortal(
                modalContent,
                document.body // Renderiza o modal direto no <body>
            )}
        </>
    );
}

export default CardCarrossel;