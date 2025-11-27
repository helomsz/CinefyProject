import React, { useState, useEffect, useRef } from 'react';
import './CineKids.css';

import NavbarCentralizada from '../../components/NavbarCentralizada/NavbarCentralizada.jsx';
import MenuLateral from '../../components/MenuLateral/MenuLateral.jsx';
import HeroSectionKids from '../../components/HeroSectionKids/HeroSectionKids.jsx';
import ProdutorasKids from '../../components/ProdutorasKids/ProdutorasKids.jsx';
import SecaoContinueKids from '../../components/SecaoConteudoKids/SecaoContinueKids.jsx';
import DestaquesKids from '../../components/DestaquesKids/DestaquesKids.jsx';
import SecaoFiltroInfantil from '../../components/SecaoFiltroInfantil/SecaoFiltroInfantil.jsx';
import SecaoCatalogoKids from '../../components/SecaoCatalogoKids/SecaoCatalogoKids.jsx';
import Footer from '../../components/Footer/Footer.jsx';

const CineKids = () => { 
  const [filmesOriginais, setFilmesOriginais] = useState([]);
  const [filmesExibidos, setFilmesExibidos] = useState([]); 
  const [filtroAtivo, setFiltroAtivo] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const catalogoRef = useRef(null); // referência para o catálogo, para fazer scroll para ele

  // useEffect para carregar filmes do backend assim que o componente for montado
  useEffect(() => {
    const fetchFilmes = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // busca filmes do servidor
            const response = await fetch('http://localhost:8000/listar_filmes_infantis');

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log("✅ DADOS RECEBIDOS DA API:", data); 

            setFilmesOriginais(data); 
            setFilmesExibidos(data); 

        } catch (e) {
            console.error("❌ Erro ao buscar filmes do backend:", e);
            setError(`Falha ao carregar dados: ${e.message}. Verifique o servidor e o endpoint.`);
            setFilmesOriginais([]);
            setFilmesExibidos([]);
        } finally {
            setIsLoading(false);
        }
    };
    fetchFilmes();
  }, []);

  // função para filtrar filmes por produtora
  const handleFilterByProducer = (producer) => { // Se já estiver ativo, desativa o filtro

    if (producer === filtroAtivo) {
      setFiltroAtivo(null);
      setFilmesExibidos(filmesOriginais);
    } else {
      setFiltroAtivo(producer);

      // filtra os filmes pela produtora selecionada
      const filmesFiltrados = filmesOriginais.filter(
        (filme) => filme.produtoras && filme.produtoras.includes(producer)
      );

      setFilmesExibidos(filmesFiltrados);
    }

    // rola suavemente até a seção de catálogo após aplicar o filtro
    setTimeout(() => {
      if (catalogoRef.current) {
        catalogoRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }, 150);
  };

  return (
    <div className="cinekids-page">
      <MenuLateral />
      <NavbarCentralizada />

      <main className="cinekids-main-content">
        <HeroSectionKids />
        
        <ProdutorasKids 
          onFilter={handleFilterByProducer} 
          filtroAtivo={filtroAtivo}
        />

        <SecaoContinueKids />
        <DestaquesKids />

        <div className="secao-filtro">
          <SecaoFiltroInfantil onFiltrar={setFilmesExibidos} />
        </div>

        {/* se não estiver carregando e não houver erro, exibe a seção do catálogo de filmes */}
        {!isLoading && !error && (
          <SecaoCatalogoKids 
            filmesFiltrados={filmesExibidos}
            ref={catalogoRef}
          />
        )}

        {isLoading && <div className="loading-message">Carregando filmes...</div>}
        {error && <div className="error-message">{error}</div>}

        <Footer />
      </main>
    </div>
  );
};

export default CineKids;
