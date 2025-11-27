import React from 'react';
import './SecaoSagas.css';
import { Link } from "react-router-dom"; 
import ImagemJogosVorazes from '../../assets/sagas/jogosVorazesHome.png'; 
import ImagemStarWars from '../../assets/sagas/starWarsHome.png'; 
import ImagemMazeRunner from '../../assets/sagas/mazeRunnerHome.png';


const CardSaga = ({ titulo, imagemUrl, tag, subtitulo }) => (
    <div className="cardSaga"> 
        <img 
            src={imagemUrl} 
            alt={`Ver detalhes da Saga: ${titulo}`} 
            className="imagemSaga" 
        />

        <div className="infoOverlay">
            <span className="tagSaga">{tag}</span>
            <h3 className="tituloSaga">{titulo}</h3>
            <p className="subtituloSaga">{subtitulo}</p> 
        </div>
    </div>
);



function SecaoSagas() {
    // definindo um array de objetos para armazenar informações das sagas
    const sagasIconicas = [
        { 
            id: 1, 
            titulo: 'Jogos Vorazes', 
            linkUrl: '/saga/jogos-vorazes',
            imagemUrl: ImagemJogosVorazes,
            tag: 'Aventura', 
            subtitulo: 'Ação | Distopia'
        },
        { 
            id: 2, 
            titulo: 'Star Wars', 
            linkUrl: '/saga/star-wars',
            imagemUrl: ImagemStarWars,
            tag: 'Ficção',
            subtitulo: 'Espacial | Épica'
        },
        { 
            id: 3, 
            titulo: 'Maze Runner', 
            linkUrl: '/saga/maze-runner',
            imagemUrl: ImagemMazeRunner,
            tag: 'Distopia',
            subtitulo: 'Mistério | Sobrevivência'
        },
    ];

    return (
        <section className="secaoSagas">
            <h2 className="tituloSecao">Sagas Icônicas</h2>
            
            <div className="containerSagas">
                {sagasIconicas.map(saga => (
                    // mapeia o array de sagas e cria um CardSaga para cada item
                    <CardSaga 
                        key={saga.id}
                        titulo={saga.titulo}
                        linkUrl={saga.linkUrl}
                        imagemUrl={saga.imagemUrl}
                        tag={saga.tag}
                        subtitulo={saga.subtitulo}
                    />
                ))}
            </div>
        </section>
    );
}

export default SecaoSagas;