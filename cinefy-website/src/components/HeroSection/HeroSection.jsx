import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';
import HeroCard from './HeroCard'; 
import capaInterstellar from '../../assets/backgroundsHome/capainterStellar.png';
import capaDuna from '../../assets/backgroundsHome/capaDuna.png';
import capaTempo from '../../assets/backgroundsHome/capaTempo.png'; 
import fundoInterstellar from '../../assets/backgroundsHome/interstellar.svg'; 
import fundoDuna from '../../assets/backgroundsHome/bannerDuna.svg'; 
import fundoTempo from '../../assets/backgroundsHome/bannerTempo.svg';

const filmesDestaque = [
  { id: 1, titulo: 'Interstellar', categoria: 'Ficção', rating: 5, imagemCapa: capaInterstellar, imagemFundo: fundoInterstellar },
  { id: 2, titulo: 'Duna', categoria: 'Aventura', rating: 4, imagemCapa: capaDuna, imagemFundo: fundoDuna },
  { id: 3, titulo: 'Tempo', categoria: 'Terror', rating: 3, imagemCapa: capaTempo, imagemFundo: fundoTempo },
];

function HeroSection() {
  const [indiceSelecionado, setIndiceSelecionado] = useState(0);
  const [fundoAnterior, setFundoAnterior] = useState(null);
  const [fundoAtual, setFundoAtual] = useState(filmesDestaque[0].imagemFundo);
  const [fadeAtivo, setFadeAtivo] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleCardClick = (index) => {
    if (index === indiceSelecionado) return;
    setFundoAnterior(fundoAtual);
    setFundoAtual(filmesDestaque[index].imagemFundo);
    setIndiceSelecionado(index);
    setFadeAtivo(true);
  };

  // Quando a animação termina, remove o fundo anterior
  useEffect(() => {
    if (fadeAtivo) {
      const timer = setTimeout(() => {
        setFundoAnterior(null);
        setFadeAtivo(false);
      }, 1500); // tempo igual ao da animação no CSS
      return () => clearTimeout(timer);
    }
  }, [fadeAtivo]);

  const handleCadastroClick = () => {
    if (email.trim() === '') {
      alert('Por favor, insira um e-mail antes de se cadastrar.');
      return;
    }
    const encodedEmail = encodeURIComponent(email.trim());
    navigate(`/cadastro?email=${encodedEmail}`);
  };

  return (
    <main className="hero-section-container">
      {/* Fundo anterior (só aparece durante o fade) */}
      {fundoAnterior && (
        <div
          className="hero-background fundo-anterior"
          style={{ backgroundImage: `url(${fundoAnterior})` }}
        ></div>
      )}

      {/* Fundo atual (fade-in controlado) */}
      <div
        key={indiceSelecionado}
        className={`hero-background fundo-atual ${fadeAtivo ? 'fade-in' : ''}`}
        style={{ backgroundImage: `url(${fundoAtual})` }}
      ></div>

      {/* conteúdo da seção */}
      <section className="hero-inner">
        <div className="hero-left">
            <h1 className="hero-title-home">O Melhor do Cinema</h1>
            <p className="hero-description-home">
              Explore um universo de filmes emocionantes, clássicos e lançamentos. Tudo ao seu alcance.
            </p>
            <div className="cta-form">
              <input
                type="email"
                placeholder="Insira seu e-mail..."
                className="cta-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="cta-button" onClick={handleCadastroClick}>
                Cadastre-se
              </button>
            </div>
        </div>

        <div className="hero-right">
          <div className="card-list">
            {filmesDestaque.map((filme, index) => (
                <HeroCard
                  key={filme.id}
                  filme={filme}
                  isSelected={index === indiceSelecionado}
                  onClick={() => handleCardClick(index)}
                />
            ))}
          </div>

          <div className="carousel-indicators">
            {filmesDestaque.map((_, index) => (
              <span
                key={index}
                className={`indicator ${index === indiceSelecionado ? 'active' : ''}`}
                onClick={() => handleCardClick(index)}
              ></span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default HeroSection;
