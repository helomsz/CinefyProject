import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CardFilme from '../CardFilme/CardFilme';
import './CardHorizontalRecomendacao.css';

const MAX_FILMES = 8; // número máximo de filmes a serem exibidos no carrossel

const SecaoCarrosselRecomendacoes = ({ filmes = [], tituloSecao = "Baseado no que você assistiu" }) => {
  const navigate = useNavigate(); // hook para navegação
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false); // controle de botão de rolagem
  const [canScrollRight, setCanScrollRight] = useState(false); // controle de botão de rolagem


  // limita a quantidade de filmes a serem exibidos
  const filmesExibidos = filmes.slice(0, MAX_FILMES);

  // função que verifica se é possível rolar para a esquerda ou direita
  const updateScrollButtons = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    const scrollEnd = scrollWidth - clientWidth;

    // verifica se há espaço para rolar
    const canScroll = scrollWidth > clientWidth;
    setCanScrollLeft(canScroll && scrollLeft > 1);
    setCanScrollRight(canScroll && scrollLeft < scrollEnd - 1);
  };

  // função que faz o scroll de acordo com a direção
  const scroll = (direction) => {
    if (!containerRef.current) return;

    const scrollAmount = containerRef.current.clientWidth * 0.8;

    containerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // efeito que atualiza os botões de navegação com base no scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const delayId = setTimeout(() => {
      updateScrollButtons();
    }, 100);

    container.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);

    const timeoutId = setTimeout(updateScrollButtons, 0);

    // limpa os eventos quando o componente for desmontado
    return () => {
      clearTimeout(delayId);
      clearTimeout(timeoutId);
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [filmesExibidos]);  // roda novamente quando filmesExibidos mudar

  return (
    <section className="secao-carrossel-favoritos-wrapper">
      <div className="secao-carrossel-favoritos__cabecalho">
        <h2 className="secao-carrossel-favoritos__titulo">{tituloSecao}</h2>

        <div className="secao-carrossel-favoritos__navegacao">
          <button
            className={`carrossel-seta esquerda ${canScrollLeft ? 'ativo' : 'inativo'}`}
            aria-label="Rolar para a esquerda"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}  // desabilita o botão se não for possível rolar
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className={`carrossel-seta direita ${canScrollRight ? 'ativo' : 'inativo'}`}
            aria-label="Rolar para a direita"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}  // desabilita o botão se não for possível rolar
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Lista de filmes */}
      <div className="secao-carrossel-favoritos__lista" ref={containerRef}>
        {/* mapeia os filmes e renderiza o CardFilme para cada um */}
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