import React, { useState } from 'react';
import { Play, Clock, X } from 'lucide-react'; 
import './CardProgresso.css';
import Relogio from '../../../assets/icones/MeuRelogio.svg'

function CardProgresso({ filme, onPlayClick }) {
    const { titulo, poster_mini, progressoMinutos, tempoTotalMinutos, trailer } = filme;

    // estado para controlar a abertura do modal de trailer
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // define o caminho da imagem do filme, usando um caminho alternativo caso a imagem não esteja disponível
    const imagemCaminho = poster_mini || 'assets/images/placeholder.png'; 

    // URL da imagem completa para exibir a capa do filme
    const urlImagem = `http://localhost:8000/${imagemCaminho}`; 
    const progressoPorcentagem = (progressoMinutos / tempoTotalMinutos) * 100;

    // formata a exibição do tempo assistido e total
    const tempoDisplay = `${progressoMinutos}/${tempoTotalMinutos} min`; 

     // define o URL do trailer, se disponível, com parâmetros para autoplay e desativar recomendações
    const youtubeEmbedUrl = trailer 
        ? `https://www.youtube.com/embed/${trailer}?autoplay=1&rel=0`
        : null;

    // função para abrir o modal do trailer, somente se houver um trailer disponível
    const handleOpenModal = (e) => {
        e.stopPropagation(); 
        
        // se o trailer estiver disponível, abre o modal
        if (youtubeEmbedUrl) {
            setIsModalOpen(true);
        } else {
            // se não houver trailer, exibe um aviso no console
            console.warn(`Trailer indisponível para o filme: ${titulo}`);
        }
    };

    // função para fechar o modal quando o usuário clicar no botão de fechar
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div 
            className="cardProgressoWrapper" 
            onClick={() => onPlayClick(filme)} // ao clicar no card, chama a função onPlayClick, passando o filme
        >
            <img 
                src={urlImagem} 
                alt={`Capa de ${titulo}`} 
                className="cardProgressoCapa" 
            />

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

                <button 
                    className="cardProgressoBotaoPlay" 
                    onClick={handleOpenModal}
                >
                    <Play size={20} fill="#fff" /> 
                </button>
            </div>
            
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