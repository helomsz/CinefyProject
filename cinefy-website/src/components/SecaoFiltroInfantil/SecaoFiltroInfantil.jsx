import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Lupa from '../../assets/icones/iconeLupaCatalogo.svg';
import Filtro from '../../assets/icones/iconeFiltro.svg';
import './SecaoFiltroInfantil.css';

const InputFiltro = ({ id, label, placeholder, valor, onChange }) => (
  <div className="inputFiltroWrapperContainer">
    <label htmlFor={id} className="labelFiltro">{label}</label>
    <div className="inputComIconeFiltro">
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={valor}
        onChange={e => onChange(e.target.value)}
        className="inputFiltro"
      />
      <img src={Lupa} alt="Ícone de busca" className="iconeBuscaDentroInput imgIcone" />
    </div>
  </div>
);

const BotoesGenero = ({ categorias, categoriaAtiva, onSelect }) => {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
  };

  const scroll = (direction) => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  useEffect(() => {
    const container = containerRef.current;
    updateScrollButtons();
    container?.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      container?.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, []);

  return (
    <div className="generoCarrosselWrapper">
      <button className="carrosselSeta esq" onClick={() => scroll('left')} disabled={!canScrollLeft}>
        <ChevronLeft size={24} />
      </button>

      <div className="generoBotoesContainer" ref={containerRef}>
        {categorias.map(cat => (
          <button
            key={cat}
            className={`botaoGenero ${categoriaAtiva === cat ? 'ativo' : ''}`}
            onClick={() => onSelect(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <button className="carrosselSeta dir" onClick={() => scroll('right')} disabled={!canScrollRight}>
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

const SecaoFiltroInfantil = ({ onFiltrar }) => {
  const categorias = ["Todos","Ação","Aventura","Comédia","Ficção","Romance","Fantasia","Musical","Infantil","Super-herói"];

  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [filtroAno, setFiltroAno] = useState("");
  const [filtroTitulo, setFiltroTitulo] = useState("");
  const [filtroAtor, setFiltroAtor] = useState("");
  const [filtroDiretor, setFiltroDiretor] = useState("");

  const abortControllerRef = useRef(null);

  const handleBusca = useCallback(async () => {
    console.log("🔍 Iniciando busca...");
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const params = new URLSearchParams();
      filtroTitulo && params.append("titulo", filtroTitulo);
      filtroAno && params.append("ano", filtroAno);
      filtroAtor && params.append("ator", filtroAtor);
      filtroDiretor && params.append("diretor", filtroDiretor);
      categoriaAtiva.toLowerCase() !== "todos" && params.append("genero", categoriaAtiva);

      const url = `http://localhost:8000/listar_filmes_infantis?${params.toString()}`;
      console.log("URL da API:", url);

      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);

      const data = await response.json();
      console.log("✅ Dados recebidos:", data);
      onFiltrar(data || []);
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("⏹ Busca abortada");
      } else {
        console.error("❌ Erro ao buscar filmes:", err);
        onFiltrar([]);
      }
    }
  }, [filtroAno, filtroTitulo, filtroAtor, filtroDiretor, categoriaAtiva, onFiltrar]);

  useEffect(() => {
    handleBusca();
    return () => abortControllerRef.current?.abort();
  }, [handleBusca]);

  return (
    <section className="secaoFiltroWrapper">
      <div className="filtroTitulo">
        <img src={Filtro} alt="Ícone de filtro" />
        <h3 className="filtroTituloTexto">Filtrar filmes</h3>
      </div>

      <div className="barraBuscaFundo">
        <InputFiltro id="ano" label="Ano" placeholder="Digite o ano" valor={filtroAno} onChange={setFiltroAno} />
        <InputFiltro id="titulo" label="Título" placeholder="Digite o título" valor={filtroTitulo} onChange={setFiltroTitulo} />
        <InputFiltro id="ator" label="Ator" placeholder="Digite o ator" valor={filtroAtor} onChange={setFiltroAtor} />
        <InputFiltro id="diretor" label="Diretor" placeholder="Digite o diretor" valor={filtroDiretor} onChange={setFiltroDiretor} />
        <button className="botaoBuscar" onClick={handleBusca}>Buscar</button>
      </div>

      <BotoesGenero categorias={categorias} categoriaAtiva={categoriaAtiva} onSelect={setCategoriaAtiva} />
    </section>
  );
};

export default SecaoFiltroInfantil;
