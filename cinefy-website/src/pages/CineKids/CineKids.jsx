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

  const catalogoRef = useRef(null);

  useEffect(() => {
    const fetchFilmes = async () => {
        setIsLoading(true);
        setError(null);

        try {
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

  const handleFilterByProducer = (producer) => {

    if (producer === filtroAtivo) {
      setFiltroAtivo(null);
      setFilmesExibidos(filmesOriginais);
    } else {
      setFiltroAtivo(producer);

      const filmesFiltrados = filmesOriginais.filter(
        (filme) => filme.produtoras && filme.produtoras.includes(producer)
      );

      setFilmesExibidos(filmesFiltrados);
    }

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
