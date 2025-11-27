import React, { useState } from 'react';
import './Catalogo.css';
import MenuLateral from '../../components/MenuLateral/MenuLateral';
import NavbarCentralizada from '../../components/NavbarCentralizada/NavbarCentralizada';
import CarrosselPrincipal from '../../components/CarrosselPrincipal/CarrosselPrincipal';
import SecaoContinueAssistindo from '../../components/SecaoConteudo/SecaoContinueAssistindo';
import SecaoCardsCatalogo from '../../components/SecaoCardsCatalogo/SecaoCardsCatalogo';
import SecaoCatalogoFilmes from '../../components/SecaoCatalogoFilmes/SecaoCatalogoFilmes';
import Footer from '../../components/Footer/Footer';
import SecaoFiltro from '../../components/SecaoFiltro/SecaoFiltro';
import MazeRunner from '../../assets/catalogo/mazeRunnerCard.png'; 
import Truque from '../../assets/catalogo/truqueCard.png';      

function Catalogo() {
    // cria o estado para armazenar os filmes filtrados
    const [filmesFiltrados, setFilmesFiltrados] = useState([]);

    // dados de filmes em alta com id, título, subtítulo e imagem do poster
    const filmesEmAlta = [
        {
            id: 101,
            titulo: "Maze Runner:",
            subtitulo: "Correr ou morrer",
            poster_capa: MazeRunner, 
            popular: true,
        },
        {
            id: 102,
            titulo: "Truque de Mestre:",
            subtitulo: "O segundo ato",
            poster_capa: Truque, 
            popular: true,
        },
    ];

    return (
        <div className="paginaCatalogo">
            <MenuLateral /> 
            <NavbarCentralizada />
            <main className="conteudoPrincipalCatalogo">
                <CarrosselPrincipal />
                <SecaoContinueAssistindo />
                <SecaoCardsCatalogo filmes={filmesEmAlta} />
                <SecaoFiltro onFiltrar={setFilmesFiltrados} />
                <SecaoCatalogoFilmes filmesFiltrados={filmesFiltrados} />

                <Footer />
            </main>
        </div>
    );
}

export default Catalogo;
