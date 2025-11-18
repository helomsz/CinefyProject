import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Lupa from '../../assets/icones/iconeLupaCatalogo.svg';
import Filtro from '../../assets/icones/iconeFiltro.svg';
import './SecaoFiltro.css';

const InputFiltro = ({ id, label, placeholder, valor, onChange }) => (
  <div className="filtroInputWrapper">
    <label htmlFor={id} className="labelFiltro">{label}</label>

    <div className="filtroInputContainer">
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="filtroInput"
      />
      <img src={Lupa} alt="Ícone de busca" className="filtroInputIcon" />
    </div>
  </div>
);

const BotoesGenero = ({ categorias, categoriaAtiva, onSelect }) => {
  const containerRef = React.useRef(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const updateScrollButtons = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
  };

  const scroll = (direction) => {
    if (!containerRef.current) return;
    const scrollAmount = 200;
    containerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateScrollButtons();
    container.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, []);

  return (
    <div className="generoCarrosselWrapper">
      <button
        className="carrosselSeta esq"
        aria-label="Rolar para a esquerda"
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
      >
        <ChevronLeft size={24} />
      </button>

      <div className="generoBotoesContainer" ref={containerRef}>
        {categorias.map((cat) => (
          <button
            key={cat}
            className={`botaoGenero ${categoriaAtiva === cat ? 'ativo' : ''}`}
            onClick={() => {
              if (categoriaAtiva !== cat) onSelect(cat);
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <button
        className="carrosselSeta dir"
        aria-label="Rolar para a direita"
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

function SecaoFiltro({ onFiltrar }) {
  const categorias = [
    "Todos", "Ação", "Aventura", "Comédia", "Ficção", "Romance", "Terror",
    "Suspense", "Fantasia", "Musical", "Drama","Distopia", "Crime", "Esporte", 
    "Infantil", "Super-herói"
  ];

  const [categoriaAtiva, setCategoriaAtiva] = React.useState("Todos");
  const [filtroAno, setFiltroAno] = React.useState("");
  const [filtroTitulo, setFiltroTitulo] = React.useState("");
  const [filtroAtor, setFiltroAtor] = React.useState("");
  const [filtroDiretor, setFiltroDiretor] = React.useState("");

  const abortControllerRef = React.useRef(null);

  const handleBusca = React.useCallback(async (generoFiltro = categoriaAtiva) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`http://localhost:8000/listar_filmes`, { signal: controller.signal });
      if (!response.ok) throw new Error("Erro ao buscar filmes");
      const data = await response.json();

      const filtrados = data.filter(filme => {
        const anoOk = filtroAno ? String(filme.ano).includes(filtroAno) : true;
        const tituloOk = filtroTitulo ? filme.titulo.toLowerCase().includes(filtroTitulo.toLowerCase()) : true;

        const atoresStr = Array.isArray(filme.atores) ? filme.atores.join(', ') : filme.atores || "";
        const atorOk = filtroAtor ? atoresStr.toLowerCase().includes(filtroAtor.toLowerCase()) : true;

        const diretoresStr = Array.isArray(filme.diretores) ? filme.diretores.join(', ') : filme.diretores || "";
        const diretorOk = filtroDiretor ? diretoresStr.toLowerCase().includes(filtroDiretor.toLowerCase()) : true;

        let generosArray = [];
        if (Array.isArray(filme.generos)) {
          generosArray = filme.generos.flatMap(g => g.split('|').map(x => x.trim().toLowerCase()));
        } else if (typeof filme.generos === 'string') {
          generosArray = filme.generos.split('|').map(x => x.trim().toLowerCase());
        }

        const generoOk = generoFiltro.toLowerCase() === "todos" 
          ? true 
          : generosArray.includes(generoFiltro.toLowerCase());

        return anoOk && tituloOk && atorOk && diretorOk && generoOk;
      });

      onFiltrar(filtrados);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Erro ao buscar filmes:", error);
        onFiltrar([]);
      }
    }
  }, [categoriaAtiva, filtroAno, filtroTitulo, filtroAtor, filtroDiretor, onFiltrar]);

  React.useEffect(() => {
    handleBusca();
    return () => abortControllerRef.current?.abort();
  }, [handleBusca]);

  return (
    <section className="secaoFiltroWrapper">
      <div className="filtroTitulo">
        <img src={Filtro} alt="Ícone de filtro" size={20} />
        <h3 className="filtroTituloTexto">Filtrar filmes</h3>
      </div>

      <div className="barraBuscaFundo">
        <InputFiltro id="ano" label="Ano" placeholder="Digite o ano" valor={filtroAno} onChange={setFiltroAno} />
        <InputFiltro id="titulo" label="Título" placeholder="Digite o título" valor={filtroTitulo} onChange={setFiltroTitulo} />
        <InputFiltro id="ator" label="Ator" placeholder="Digite o ator" valor={filtroAtor} onChange={setFiltroAtor} />
        <InputFiltro id="diretor" label="Diretor" placeholder="Digite o diretor" valor={filtroDiretor} onChange={setFiltroDiretor} />
        <button className="botaoBuscar" onClick={() => handleBusca(categoriaAtiva)}>
          Buscar
        </button>
      </div>

      <BotoesGenero 
        categorias={categorias} 
        categoriaAtiva={categoriaAtiva} 
        onSelect={setCategoriaAtiva}
      />
    </section>
  );
}

export default SecaoFiltro;
