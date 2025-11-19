import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CardFilme from '../CardFilme/CardFilme'; 
import './CardHorizontalRecomendacao.css';

// Define o limite máximo de filmes
const MAX_FILMES = 8; 

const SecaoCarrosselRecomendacoes = ({ filmes = [], tituloSecao = "Baseado no que você assistiu" }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // NOVO: Aplica o limite de 8 filmes
  const filmesExibidos = filmes.slice(0, MAX_FILMES);

  const updateScrollButtons = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;

    const scrollEnd = scrollWidth - clientWidth;

    // Verifica se a rolagem é possível (se o conteúdo ultrapassa o container)
    const canScroll = scrollWidth > clientWidth;

    // A seta esquerda fica ativa se já rolou para a direita
    setCanScrollLeft(canScroll && scrollLeft > 1);
    // A seta direita fica ativa se ainda houver conteúdo para rolar
    setCanScrollRight(canScroll && scrollLeft < scrollEnd - 1);
  };

  const scroll = (direction) => {
    if (!containerRef.current) return;

    const scrollAmount = containerRef.current.clientWidth * 0.8; 

    containerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // NOVO: Adiciona um pequeno atraso para garantir que as imagens carreguem
    // e o browser calcule corretamente o 'scrollWidth' total.
    const delayId = setTimeout(() => {
        updateScrollButtons();
    }, 100); 

    container.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);

    // O setTimeout original pode ser mantido
    const timeoutId = setTimeout(updateScrollButtons, 0);

    return () => {
      clearTimeout(delayId); // Limpa o novo timeout
      clearTimeout(timeoutId);
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [filmesExibidos]); // Depende dos filmes exibidos

  return (
    <section className="secao-carrossel-favoritos-wrapper">
      <div className="secao-carrossel-favoritos__cabecalho">
        <h2 className="secao-carrossel-favoritos__titulo">{tituloSecao}</h2>

        <div className="secao-carrossel-favoritos__navegacao">
          <button
            className={`carrossel-seta esquerda ${canScrollLeft ? 'ativo' : 'inativo'}`}
            aria-label="Rolar para a esquerda"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft} // Desativa o botão se não puder rolar
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className={`carrossel-seta direita ${canScrollRight ? 'ativo' : 'inativo'}`}
            aria-label="Rolar para a direita"
            onClick={() => scroll('right')}
            disabled={!canScrollRight} // Desativa o botão se não puder rolar
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="secao-carrossel-favoritos__lista" ref={containerRef}>
        {filmesExibidos.map((filme) => (
          <CardFilme
            key={filme.id} 
            titulo={filme.titulo}
            genero={filme.generos || 'Gênero Desconhecido'}
            nota={filme.avaliacao_media || 0.0}
            posterMini={filme.poster_mini}
            trailer={filme.trailer}
            onClick={() => navigate(`/detalhes/${filme.id}`)}
          />
        ))}
      </div>
    </section>
  );
};

export default SecaoCarrosselRecomendacoes;