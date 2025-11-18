import React, { useState } from 'react';
import { Play, Clock, X } from 'lucide-react'; // X (ícone de fechar) é usado
import './CardProgresso.css';
import Relogio from '../../../assets/icones/MeuRelogio.svg'

function CardProgresso({ filme, onPlayClick }) {
    const { titulo, poster_mini, progressoMinutos, tempoTotalMinutos, trailer } = filme;

    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const imagemCaminho = poster_mini || 'assets/images/placeholder.png'; 
    const urlImagem = `http://localhost:8000/${imagemCaminho}`; 
    const progressoPorcentagem = (progressoMinutos / tempoTotalMinutos) * 100;
    const tempoDisplay = `${progressoMinutos}/${tempoTotalMinutos} min`; 

    const youtubeEmbedUrl = trailer 
        ? `https://www.youtube.com/embed/${trailer}?autoplay=1&rel=0`
        : null;

    // Função de abertura do modal com a CORREÇÃO:
    const handleOpenModal = (e) => {
        // CORREÇÃO CRÍTICA: Impede que o clique no botão de Play suba para o wrapper do card
        e.stopPropagation(); 
        
        if (youtubeEmbedUrl) {
            setIsModalOpen(true);
        } else {
            console.warn(`Trailer indisponível para o filme: ${titulo}`);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div 
            className="cardProgressoWrapper" 
            onClick={() => onPlayClick(filme)} // Clique no card vai para a página do filme
        >
            <img 
                src={urlImagem} 
                alt={`Capa de ${titulo}`} 
                className="cardProgressoCapa" 
            />
            
            {/* Barra de Progresso */}
            <div className="cardProgressoBarraFundo">
                <div 
                    className="cardProgressoBarraPreenchimento" 
                    style={{ width: `${progressoPorcentagem}%` }}
                />
            </div>

            <div className="cardProgressoRodape">
                <div className="cardProgressoInfo">
                    <h4 className="cardProgressoTitulo">{titulo}</h4>
                    
                    <div className="cardProgressoDivisor"></div> 
                    
                    <span className="cardProgressoTempoContainer">
                        <img src={Relogio} alt="Relogio" size={16} className="clockIcon" /> 
                        <span className="cardProgressoTempo">{tempoDisplay}</span>
                    </span>
                </div>
                
                {/* Botão Play: Chama a função que abre o modal sem propagar */}
                <button 
                    className="cardProgressoBotaoPlay" 
                    onClick={handleOpenModal}
                >
                    <Play size={20} fill="#fff" /> 
                </button>
            </div>
            
            {/* --- MODAL DO TRAILER --- */}
            {isModalOpen && youtubeEmbedUrl && (
                <div className="modalOverlay" onClick={handleCloseModal}>
                    <div className="modalContent" onClick={e => e.stopPropagation()}> 
                        
                        <div className="modalHeader">
                            <h4 className="modalTitle">
                                <span className="modalTitleLabel">Trailer</span>
                                <span className="modalTitleContent">{titulo} | 2024</span> 
                            </h4>
                            
                            <button className="modalCloseButton" onClick={handleCloseModal}>
                                <X size={20} /> 
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
        </div>
    );
}

export default CardProgresso;