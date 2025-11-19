import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Importação NECESSÁRIA

import HeroSection from "../../components/HeroSection/HeroSection";
import NavbarCentralizada from "../../components/NavbarCentralizada/NavbarCentralizada";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import SecaoFilmes from "../../components/SecaoFilmes/SecaoFilmes";
import SecaoLancamentos from "../../components/SecaoLancamentos/SecaoLancamentos";
import SecaoPlanos from "../../components/SecaoPlanos/SecaoPlanos";
import SecaoSagas from "../../components/SecaoSagas/SecaoSagas";
import SecaoTopSemana from "../../components/SecaoTopSemana/SecaoTopSemana";
import CardErroCentralizado from "../../components/CardErroCentralizado/CardErroCentralizado";
import Footer from "../../components/Footer/Footer";
import "./Home.css";

const URL_API_FILMES = "http://localhost:8000/listar_filmes";

function HomePage() {
  const [filmes, setFilmes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);

  // Chame o useLocation
  const location = useLocation();

  useEffect(() => {
    const controller = new AbortController();

    const buscarFilmes = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const response = await fetch(URL_API_FILMES, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Erro HTTP ${response.status}. Falha ao carregar filmes.`
          );
        }

        const dadosJson = await response.json();
        setFilmes(dadosJson);
      } catch (e) {
        if (e.name === "AbortError") return;
        console.error("Falha na busca de filmes:", e.message);
        setErro("Não foi possível conectar ao servidor ou carregar os dados.");
      } finally {
        setCarregando(false);
        setTimeout(() => setFadeIn(true), 300);
      }
    };

    buscarFilmes();
    return () => controller.abort();
    // Altera a dependência para rodar sempre que o caminho mudar
  }, [location.pathname]);

  const filmesEmAlta = filmes.slice(0, 4);
  const filmesRecomendados = filmes.slice(4, 8);
  const Lancamentos = filmes.slice(8, 14);
  const TopSemana = filmes.slice(14, 20);

  if (erro) {
    return (
      <main className="containerPrincipal">
        <MenuLateral />
        <NavbarCentralizada />
        <CardErroCentralizado
          mensagemErro={`Erro ao carregar os filmes: ${erro}`}
        />
      </main>
    );
  }

  return (
    <main
      className={`containerPrincipal ${fadeIn ? "fade-in" : "fade-hidden"}`}
    >
      <div className="nav">
        <NavbarCentralizada />
      </div>

      <div className="menu">
        <MenuLateral />
      </div>

      <HeroSection />

      <div className="HomePageContent">
        {/* Em Alta */}
        {filmesEmAlta.length > 0 && (
          <SecaoFilmes tituloSecao="Em Alta" listaFilmes={filmesEmAlta} />
        )}

        {/* Recomendados */}
        {filmesRecomendados.length > 0 && (
          <SecaoFilmes
            tituloSecao="Recomendados"
            listaFilmes={filmesRecomendados}
          />
        )}

        {/* Lançamentos */}
        {Lancamentos.length > 0 && (
          <SecaoLancamentos
            tituloSecao="Lançamentos"
            listaFilmes={Lancamentos}
          />
        )}

        {/* Seções fixas */}
        <SecaoPlanos />
        <SecaoSagas />

        {/* Top da Semana */}
        {TopSemana.length > 0 && (
          <SecaoTopSemana tituloSecao="Top da Semana" listaFilmes={TopSemana} />
        )}

        {/* Fallback quando não há filmes */}
        {filmes.length === 0 && !carregando && (
          <p className="p-10 text-gray-400">
            Nenhum filme encontrado no banco de dados.
          </p>
        )}

        <Footer />
      </div>
    </main>
  );
}

export default HomePage;
