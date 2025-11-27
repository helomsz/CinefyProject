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
        onChange={(e) => onChange(e.target.value)} // chama a função onChange quando o valor do input mudar
        className="filtroInput"
      />
      <img src={Lupa} alt="Ícone de busca" className="filtroInputIcon" />
    </div>
  </div>
);

// define o componente de botões para filtrar por categoria
const BotoesGenero = ({ categorias, categoriaAtiva, onSelect }) => {

  const containerRef = React.useRef(null); // cria uma referência para o container dos botões
  const [canScrollLeft, setCanScrollLeft] = React.useState(false); // controle do botão de rolagem 
  const [canScrollRight, setCanScrollRight] = React.useState(false); // controle do botão de rolagem 

  const updateScrollButtons = () => { // função que atualiza os botões de rolagem
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current; // pega o estado do scroll
    setCanScrollLeft(scrollLeft > 0); // verifica se o scroll está à esquerda
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
  };

  const scroll = (direction) => {
    if (!containerRef.current) return;
    const scrollAmount = 200; // quantidade do scroll
    containerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  React.useEffect(() => { // hook de efeito para atualizar os botões de rolagem
    const container = containerRef.current;
    if (!container) return;
 
    updateScrollButtons(); // atualiza o estado dos botões de rolagem
    container.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);

    return () => {  // limpa os event listeners quando o componente for desmontado
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, []); // o hook só é chamado uma vez, ao montar o componente

  return (
    <div className="generoCarrosselWrapper">
      <button
        className="carrosselSeta esq"
        aria-label="Rolar para a esquerda"
        onClick={() => scroll('left')}  // chama a função de scroll à esquerda
        disabled={!canScrollLeft}
      >
        <ChevronLeft size={24} />
      </button>

      <div className="generoBotoesContainer" ref={containerRef}>
        {categorias.map((cat) => ( // mapeia as categorias e cria um botão para cada uma
          <button
            key={cat}
            className={`botaoGenero ${categoriaAtiva === cat ? 'ativo' : ''}`}
            onClick={() => { // ao clicar no botão, seleciona a categoria
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
        onClick={() => scroll('right')} // chama a função de scroll à direita
        disabled={!canScrollRight}
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

function SecaoFiltro({ onFiltrar }) { // define o componente principal da seção de filtro
  const categorias = [  // lista de categorias para filtrar
    "Todos", "Ação", "Aventura", "Comédia", "Ficção", "Romance", "Terror",
    "Suspense", "Fantasia", "Musical", "Drama","Distopia", "Crime", "Esporte", 
    "Infantil", "Super-herói"
  ];

  const [categoriaAtiva, setCategoriaAtiva] = React.useState("Todos"); // estado da categoria ativa
  const [filtroAno, setFiltroAno] = React.useState("");
  const [filtroTitulo, setFiltroTitulo] = React.useState("");
  const [filtroAtor, setFiltroAtor] = React.useState("");
  const [filtroDiretor, setFiltroDiretor] = React.useState("");

  const abortControllerRef = React.useRef(null); // referência para controlar o abortamento da requisição

  const handleBusca = React.useCallback(async (generoFiltro = categoriaAtiva) => { // função que busca os filmes filtrados
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`http://localhost:8000/listar_filmes`, { signal: controller.signal }); // faz a requisição para listar filmes
      if (!response.ok) throw new Error("Erro ao buscar filmes");
      const data = await response.json();

      const filtrados = data.filter(filme => { // filtra os filmes com base nos critérios definidos
        const anoOk = filtroAno ? String(filme.ano).includes(filtroAno) : true;
        const tituloOk = filtroTitulo ? filme.titulo.toLowerCase().includes(filtroTitulo.toLowerCase()) : true;

        const atoresStr = Array.isArray(filme.atores) ? filme.atores.join(', ') : filme.atores || "";
        const atorOk = filtroAtor ? atoresStr.toLowerCase().includes(filtroAtor.toLowerCase()) : true;

        const diretoresStr = Array.isArray(filme.diretores) ? filme.diretores.join(', ') : filme.diretores || "";
        const diretorOk = filtroDiretor ? diretoresStr.toLowerCase().includes(filtroDiretor.toLowerCase()) : true;

        let generosArray = []; // cria um array com os gêneros
        if (Array.isArray(filme.generos)) {
          generosArray = filme.generos.flatMap(g => g.split('|').map(x => x.trim().toLowerCase()));
        } else if (typeof filme.generos === 'string') {
          generosArray = filme.generos.split('|').map(x => x.trim().toLowerCase()); // trata gênero em string
        }

        // se a categoria for "todos", não filtra por gênero
        const generoOk = generoFiltro.toLowerCase() === "todos" 
          ? true 
          : generosArray.includes(generoFiltro.toLowerCase());  // verifica se o gênero corresponde

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
