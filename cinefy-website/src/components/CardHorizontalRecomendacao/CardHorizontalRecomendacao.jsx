import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import './CardHorizontalRecomendacao.css';

// Mock Data (Substituir pela API real no futuro)
const MOCK_RECOMENDACOES = [
  { id: 1, titulo: "Jogos Vorazes", imagemUrl: "https://placehold.co/300x400/1C1C1C/FFFFFF?text=Jogos+Vorazes", generos: "Distopia | Ficção", nota: "4.9" },
  { id: 2, titulo: "Pecadores", imagemUrl: "https://placehold.co/300x400/1C1C1C/FFFFFF?text=Pecadores", generos: "Ação | Terror", nota: "4.3" },
  { id: 3, titulo: "Thunderbolts", imagemUrl: "https://placehold.co/300x400/1C1C1C/FFFFFF?text=Thunderbolts", generos: "Ação | Ficção", nota: "4.0" },
  { id: 4, titulo: "Harry Potter", imagemUrl: "https://placehold.co/300x400/1C1C1C/FFFFFF?text=Harry+Potter", generos: "Fantasia | Aventura", nota: "4.6" },
  { id: 5, titulo: "O Predador", imagemUrl: "https://placehold.co/300x400/1C1C1C/FFFFFF?text=O+Predador", generos: "Ficção | Suspense", nota: "4.1" },
  { id: 6, titulo: "Barbie", imagemUrl: "https://placehold.co/300x400/1C1C1C/FFFFFF?text=Barbie", generos: "Comédia | Fantasia", nota: "3.9" },
  { id: 7, titulo: "Duna: Parte II", imagemUrl: "https://placehold.co/300x400/1C1C1C/FFFFFF?text=Duna+2", generos: "Ficção | Drama", nota: "4.8" },
  { id: 8, titulo: "A Origem", imagemUrl: "https://placehold.co/300x400/1C1C1C/FFFFFF?text=A+Origem", generos: "Ação | Suspense", nota: "4.7" },
];


// Subcomponente de Card (Horizontal/Carrossel)
const CardHorizontalRecomendacao = ({ titulo, imagemUrl, generos, nota }) => {
  return (
    <div className="card-recomendacao">
      <div className="card-recomendacao__imagem">
        <img 
          src={imagemUrl} 
          alt={`Capa do filme ${titulo}`} 
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/300x400/1C1C1C/FFFFFF?text=Capa+Indisponível"; }}
        />
        <div className="card-recomendacao__overlay">
          <Play size={40} className="card-recomendacao__icone-play" />
        </div>
      </div>
      <div className="card-recomendacao__info">
        <span className="card-recomendacao__generos">{generos}</span>
        <span className="card-recomendacao__nota">★ {nota}</span>
      </div>
    </div>
  );
};


// Componente Principal do Carrossel
const SecaoCarrosselRecomendacoes = () => {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    
    // Tolerância de 1 pixel para garantir que a seta apareça/desapareça corretamente
    const scrollEnd = scrollWidth - clientWidth;

    setCanScrollLeft(scrollLeft > 1); // Pode rolar para a esquerda se não estiver no início
    setCanScrollRight(scrollLeft < scrollEnd - 1); // Pode rolar para a direita se não estiver no final
  };

  const scroll = (direction) => {
    if (!containerRef.current) return;
    // Baseado na largura de 4 cards visíveis em desktop, 300px * 4 = 1200px. Usamos uma medida relativa.
    const scrollAmount = containerRef.current.clientWidth * 0.8; 
    
    containerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateScrollButtons();
    container.addEventListener('scroll', updateScrollButtons);
    // Adiciona listener para recalcular em redimensionamento
    window.addEventListener('resize', updateScrollButtons); 

    // O setTimeout garante que o cálculo inicial seja feito após a renderização dos cards
    const timeoutId = setTimeout(updateScrollButtons, 0); 
    
    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, []);


  return (
    <section className="secao-carrossel-wrapper">
      <div className="secao-carrossel__cabecalho">
        <h2 className="secao-carrossel__titulo">Baseado no que você assistiu</h2>
        <div className="secao-carrossel__navegacao">
          <button
            className="carrossel-seta esquerda"
            aria-label="Rolar para a esquerda"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="carrossel-seta direita"
            aria-label="Rolar para a direita"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="secao-carrossel__lista" ref={containerRef}>
        {MOCK_RECOMENDACOES.map((filme) => (
          <CardHorizontalRecomendacao 
            key={filme.id} 
            {...filme} 
          />
        ))}
      </div>
    </section>
  );
};

export default SecaoCarrosselRecomendacoes;