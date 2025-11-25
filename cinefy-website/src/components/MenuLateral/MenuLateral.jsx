import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import './MenuLateral.css';
import IconeCasa from '../../assets/icones/iconeCasa.svg';
import IconeExplorar from '../../assets/icones/iconeExplorar.svg';
import IconeCoracao from '../../assets/icones/iconeCoracao.svg';
import IconeAdicionar from '../../assets/icones/iconeAdicionar.svg';
import IconePerfil from '../../assets/icones/iconePerfil.svg';
import IconeCrianca from '../../assets/icones/iconeCrianca.svg';
import Logo from '../../assets/icones/LOGO.svg';
import IconeMenuFechar from '../../assets/icones/iconeMenuFechar.svg'; 

const itensMenu = [
  { nome: 'Homepage', icone: IconeCasa, link: '/' },
  { nome: 'Explorar', icone: IconeExplorar, link: '/catalogo' },
  { nome: 'Favoritos', icone: IconeCoracao, link: '/favoritos' },
  { nome: 'Cinefy Kids', icone: IconeCrianca, link: '/cinefykids' },
  { nome: 'Adicionar filme', icone: IconeAdicionar, link: '/adicionar' },
];


function MenuLateral() {
  const [estaAberto, setEstaAberto] = useState(false);
  const [travado, setTravado] = useState(false);
  const [itemAtivo, setItemAtivo] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const itemAtual = [...itensMenu].find(
      (item) => item.link === location.pathname
    );
    if (itemAtual) setItemAtivo(itemAtual.nome);
  }, [location.pathname]);

  const alternarMenu = () => {
    setTravado(!travado);
    setEstaAberto(!travado);
  };

  const handleMouseEnter = () => {
    if (!travado) setEstaAberto(true);
  };

  const handleMouseLeave = () => {
    if (!travado) setEstaAberto(false);
  };

  const handleItemClick = (item) => {
    navigate(item.link);
  };

  const renderizarItem = (item) => (
    <li
      key={item.nome}
      className={`menuLateralItem ${itemAtivo === item.nome ? 'itemDestaque' : ''}`}
    >
      <button
        onClick={() => handleItemClick(item)}
        className="botaoItemMenu"
        title={item.nome}
      >
        <div className={`iconeWrapper ${!estaAberto && 'wrapperFechado'}`}>
          <img src={item.icone} alt={`Ícone ${item.nome}`} className="iconeMenu" />
        </div>
        {estaAberto && <span className="textoItem">{item.nome}</span>}
      </button>
    </li>
  );

  return (
    <div
      className={`menuLateral ${estaAberto ? 'aberto' : 'fechado'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="logoSuperior">
        <button
          className={`botaoLogoTopo ${estaAberto ? 'fechar' : 'abrir'}`}
          onClick={alternarMenu}
          title={estaAberto ? 'Fechar Menu' : 'Abrir Menu'}
        >
          <img src={Logo} alt="Logo Cinefy" className="imagemLogoTopo" />
          {estaAberto && <span className="nomeApp">CINE<i>FY</i></span>}
          {estaAberto && (
            <img src={IconeMenuFechar} alt="Fechar" className="iconeFechar" />
          )}
        </button>
      </div>

      <ul className="listaMenuPrincipal">{itensMenu.map(renderizarItem)}</ul>



    </div>
  );
}
export default MenuLateral;
