import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; 
import CardCarrossel from '../CardCarrossel/CardCarrossel'; 
import './CarrosselPrincipal.css';
import JogosVorazes from '../../assets/carrosselCatalogo/jogosVorazesCarrossel.png'
import PanteraNegra from '../../assets/carrosselCatalogo/panteraNegraCarrossel.png'
import TelefonePreto from '../../assets/carrosselCatalogo/telelefonePretoCarrossel.png'
import Batman from '../../assets/carrosselCatalogo/batmanCarrossel.png'
import JohnWick from '../../assets/carrosselCatalogo/johnWickCarrossel.png'

const mockFilmesCarrossel = [
    { 
        id: 1, 
        titulo: 'Jogos Vorazes', 
        descricao: 'Em um futuro distópico, Katniss luta nos Jogos Vorazes para salvar sua irmã. A sobrevivência se torna uma batalha contra a opressão.', 
        capaFundo: JogosVorazes, 
        trailer: '7HDfIssATE4'
    },
    { 
        id: 2, 
        titulo: 'Pantera Negra', 
        descricao: 'T\'Challa, o Pantera Negra, retorna para casa como rei de Wakanda, mas é desafiado por um adversário poderoso.', 
        capaFundo: PanteraNegra, 
        trailer: 'wL4a4MafSjQ'
    },
    { 
        id: 3, 
        titulo: 'O Telefone Preto', 
        descricao: 'Em O Telefone Preto (2022), um garoto sequestrado descobre um telefone que o conecta às vítimas anteriores de seu raptor.', 
        capaFundo: TelefonePreto, 
        trailer: 'dCAbPQnFAU4&t=30s'
    },
    { 
        id: 4, 
        titulo: 'Batman', 
        descricao: 'Em Batman (2022), o herói enfrenta o Charada enquanto desvenda a corrupção e segredos sombrios de Gotham.', 
        capaFundo: Batman, 
        trailer: 'mqqft2x_Aa4'
    },
    { 
        id: 5, 
        titulo: 'John Wick', 
        descricao: 'Em John Wick (2014), um ex-assassino busca vingança após criminosos destruírem tudo o que lhe restava de paz.', 
        capaFundo: JohnWick, 
        trailer: '3OtwXTiygOM'
    },
];


function CarrosselPrincipal() {
    const [indiceAtivo, setIndiceAtivo] = useState(0);

    const proximoSlide = () => {
        setIndiceAtivo((prevIndice) => 
            (prevIndice + 1) % mockFilmesCarrossel.length
        );
    };

    const slideAnterior = () => {
        setIndiceAtivo((prevIndice) => 
            (prevIndice - 1 + mockFilmesCarrossel.length) % mockFilmesCarrossel.length
        );
    };

    return (
        <div className="carrosselPrincipalContainer">

            <div className="carrosselAreaCards">
                {mockFilmesCarrossel.map((filme, index) => {
                    let className = 'cardCarrosselItem';
                    const diff = (index - indiceAtivo + mockFilmesCarrossel.length) % mockFilmesCarrossel.length;
                    
                    if (index === indiceAtivo) {
                        className += ' ativo';
                    } else if (diff === 1 || diff === 1 - mockFilmesCarrossel.length) {
                        className += ' proximo';
                    } else if (diff === mockFilmesCarrossel.length - 1 || diff === -1) { 
                        className += ' anterior';
                    } else if (diff === 2 || diff === 2 - mockFilmesCarrossel.length) { 
                        className += ' proximo-distante';
                    } else if (diff === mockFilmesCarrossel.length - 2 || diff === -2) { 
                        className += ' anterior-distante';
                    } else {
                        className += ' escondido';
                    }

                    return (
                        <CardCarrossel 
                            key={filme.id} 
                            filme={filme} 
                            className={className}
                            trailer={filme.trailer}
                            onCardClick={proximoSlide}
                        />
                    );
                })}
            </div>
            <div className="carrosselIndicadores">
                {mockFilmesCarrossel.map((_, index) => (
                    <span 
                        key={index}
                        className={`indicadorPonto ${index === indiceAtivo ? 'ativo' : ''}`}
                        onClick={() => setIndiceAtivo(index)}
                    ></span>
                ))}
            </div>
        </div>
    );
}

export default CarrosselPrincipal;