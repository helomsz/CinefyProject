import React from 'react';
import './Footer.css';
import Logo from '../../assets/icones/LOGO.svg';

// Importe os ícones das redes sociais (usando placeholders genéricos por enquanto)
import { Instagram, Youtube, Facebook, Twitter } from 'lucide-react'; 

function Footer() {
    return (
        <footer className="mainFooter">
            <div className="footerContainer">
                
                {/* 1. Coluna de Informações e Logo */}
                <div className="footerColuna infoColuna">
                    <div className="logoFooter">
                        {/* Se você tiver um componente SVG ou PNG da CINEFY, coloque aqui */}
                        <img 
                            src={Logo}
                            alt="CINEFY Logo" 
                            className="logoIcon"
                        />
                        <span className="logoTexto">CINE<i>FY</i></span>
                    </div>
                    <p className="descricaoFooter">
                        Descubra, assista e viva histórias que vão 
                        além da tela, onde seus filmes favoritos 
                        estão sempre ao seu alcance.
                    </p>
                </div>

                {/* 2. Coluna Explore (Navegação) */}
                <div className="footerColuna">
                    <h4 className="tituloColuna">Explore</h4>
                    <ul className="listaLinks">
                        <li><a href="/catalogo">Conheça o catálogo</a></li>
                        <li><a href="/catalogo/infantil">Catálogo infantil</a></li>
                        <li><a href="/adicionar-filme">Adicione filmes</a></li>
                    </ul>
                </div>

                {/* 3. Coluna Suporte */}
                <div className="footerColuna">
                    <h4 className="tituloColuna">Suporte</h4>
                    <ul className="listaLinks">
                        <li><a href="/contato">Entre em contato</a></li>
                        <li><a href="/faq">Dúvidas?</a></li>
                        <li><a href="/criticas">Críticas e reclamações</a></li>
                    </ul>
                </div>

            </div>

            {/* Linha de Rodapé Inferior */}
            <div className="footerBottom">
                <p className="designInfo">
                    Design by Heloisa Militão de Souza
                </p>
                <div className="socialMedia">
                    <p className="socialText">Nossa história continua:</p>
                    <div className="socialIcons">
                        <a href="#"><Instagram size={20} color="#ffffff" /></a>
                        <a href="#"><Youtube size={20} color="#ffffff" /></a>
                        <a href="#"><Facebook size={20} color="#ffffff" /></a>
                        <a href="#"><Twitter size={20} color="#ffffff" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
export default Footer;