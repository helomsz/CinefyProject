import React, { useState, useEffect } from 'react';
import { Play, Star, ChevronLeft, ChevronRight, X } from 'lucide-react';
import './DestaquesKids.css'; 

import ElementosImage from '../../assets/cinefyKids/elementoPoster.png'; 
import ZootopiaImage from '../../assets/cinefyKids/zootopiaPoster.png';
import KungFu from '../../assets/cinefyKids/kungfuPoster.png';
import Elementosbg from '../../assets/cinefyKids/elementosbg.png'; 
import Zootopiabg from '../../assets/cinefyKids/zootopiabg.png'; 
import KungFubg from '../../assets/cinefyKids/kunfubg.png'; 

// mock de filmes de destaque para a seção Kids
const filmesDestaque = [
    { 
        id: 1, 
        title: "Elementos", 
        info: "Romance | Fantasia", 
        duration: "1h49min", 
        year: 2023, 
        rating: 3, 
        image: ElementosImage,
        bgImage: Elementosbg,
        trailer: "https://www.youtube.com/embed/XpZterwuuc4" 
    },
    { 
        id: 2, 
        title: "Zootopia", 
        info: "Aventura | Comédia", 
        duration: "1h48min", 
        year: 2016, 
        rating: 4, 
        image: ZootopiaImage,
        bgImage: Zootopiabg,
        trailer: "https://www.youtube.com/embed/ljBuf7PI0zM"
    },
    { 
        id: 3, 
        title: "Kung Fu Panda", 
        info: "Infantil | Comédia", 
        duration: "1h32min", 
        year: 2008, 
        rating: 4, 
        image: KungFu,
        bgImage: KungFubg,
        trailer: "https://www.youtube.com/embed/NRc-ze7Wrxw"
    }
];

// componente para renderizar as estrelas de avaliação
const RatingStars = ({ count }) => {
    return (
        <div className="rating-stars">
            {Array.from({ length: 5 }, (_, index) => (
                <Star 
                    key={index} 
                    size={20} 
                    fill={index < count ? '#ffffffff' : 'none'}
                    color={index < count ? '#fcfcfcff' : '#9CA3AF'} 
                />
            ))}
        </div>
    );
}

// modal de trailer, aberto ao clicar em assistir trailer
const TrailerModal = ({ isOpen, trailerUrl, onClose, title, year }) => {
    if (!isOpen || !trailerUrl) return null;

    return (
        <div className="trailer-modal-overlay" onClick={onClose}>
            <div 
                className="trailer-modal-content"
                onClick={e => e.stopPropagation()}  // evita fechar o modal ao clicar dentro dele
            >
                <div className="trailer-modal-header">
                    <h4 className="trailer-modal-title">Trailer | {title} | {year}</h4>
                    <button 
                        onClick={onClose} 
                        className="trailer-modal-close"
                        aria-label="Fechar Trailer"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="trailer-modal-iframe-container">
                    <iframe 
                        src={`${trailerUrl}?autoplay=1`}
                        title="Trailer do Filme"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

// componente principal da seção de destaques Kids
const DestaquesKids = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fadeBg, setFadeBg] = useState(false);
    const [showTrailerModal, setShowTrailerModal] = useState(false);
    const [currentTrailer, setCurrentTrailer] = useState(null); 

    const currentFilme = filmesDestaque[currentIndex];

    // função chamada ao clicar para assistir o trailer
    const handleTrailerClick = (filme) => {
        if (filme.trailer) {
            setCurrentTrailer(filme);
            setShowTrailerModal(true);
        } else {
            console.warn(`URL do trailer não encontrada para o filme: ${filme.title}`);
        }
    };
    
    // função para trocar de filme
    const changeMovie = (newIndex) => {
        setFadeBg(true);
        setTimeout(() => {
            setCurrentIndex(newIndex);
            setFadeBg(false);
        }, 400); 
    };

    // função para exibir o próximo filme
    const nextMovie = () => {
        const newIndex = (currentIndex === filmesDestaque.length - 1) ? 0 : currentIndex + 1;
        changeMovie(newIndex);
    };

    // função para exibir o filme anterior
    const prevMovie = () => {
        const newIndex = (currentIndex === 0) ? filmesDestaque.length - 1 : currentIndex - 1;
        changeMovie(newIndex);
    };

    return (
        <section className="kids-section destaques-kids-section">
            <div className="destaques-list-container">
                <div className="destaque-card-wrapper">
                    
                    <div 
                        className={`card-background-art ${fadeBg ? 'fade' : ''}`} 
                        style={{ backgroundImage: `url(${currentFilme.bgImage})` }}
                    ></div>

                    <div className="destaque-card-content">
                        <div className="card-poster-container">
                            <img 
                                src={currentFilme.image} 
                                alt={`Poster de ${currentFilme.title}`} 
                                className="card-poster"
                            />
                        </div>

                        <div className="card-details">
                            <h3 className="card-title">{currentFilme.title}</h3>
                            <p className="card-genre">{currentFilme.info}</p>
                            <p className="card-runtime">{currentFilme.duration} - {currentFilme.year}</p>
                            <RatingStars count={currentFilme.rating} />
                            
                            {/* botão para assistir o trailer */}
                            <button 
                                className="trailer-button"
                                onClick={() => handleTrailerClick(currentFilme)}
                            >
                                <Play size={20} fill='white' />
                                Assistir trailer
                            </button>
                        </div>
                    </div>

                    {/* botões para navegar entre os filmes */}
                    <div className="slider-arrows">
                        <button className="arrow-button left" onClick={prevMovie}>
                            <ChevronLeft size={30} />
                        </button>
                        <button className="arrow-button right" onClick={nextMovie}>
                            <ChevronRight size={30} />
                        </button>
                    </div>
                </div>
            </div>

            {/* modal de trailer */}
            <TrailerModal 
                isOpen={showTrailerModal} 
                trailerUrl={currentTrailer?.trailer} 
                title={currentTrailer?.title}
                year={currentTrailer?.year}
                onClose={() => {
                    setShowTrailerModal(false);
                    setCurrentTrailer(null); 
                }}
            />
        </section>
    );
};

export default DestaquesKids;