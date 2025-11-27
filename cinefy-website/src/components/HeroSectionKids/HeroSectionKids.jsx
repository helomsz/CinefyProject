import React from 'react';
import './HeroSectionKids.css';
import BackgroundImage from '../../assets/cinefyKids/backgroundCinefy.png';
import CardMoana from '../../assets/cinefyKids/Moana.png';
import CardMcQueen from '../../assets/cinefyKids/Carros.png';
import CardLuca from '../../assets/cinefyKids/Luca.png';
import CardDory from '../../assets/cinefyKids/Dory.png';
import CardHome from '../../assets/cinefyKids/Home.png';
import CameraIcone from "../../assets/icones/iconeCameraKids.svg"

// dados dos filmes para os cards
const cards = [
  { id: 1, title: 'Oh Home', image: CardHome, positionClass: 'card-home' },
  { id: 2, title: 'McQueen', image: CardMcQueen, positionClass: 'card-mcqueen' },
  { id: 3, title: 'Moana', image: CardMoana, positionClass: 'card-moana' },
  { id: 4, title: 'Luca', image: CardLuca, positionClass: 'card-luca' },
  { id: 5, title: 'Dory', image: CardDory, positionClass: 'card-dory' },
];

function HeroSectionKids() {
  return (
    <div className="heroKidsContainer">
      <div className="heroKidsOverlay">
        <div className="heroKidsContent">
          {/* tagline com ícone de câmera */}
          <div className="heroKidsTagline">
            <div className="camera-icon-wrapper">
              <img src={CameraIcone} alt="Camera" size={18} className="camera-icon-tag" />
            </div>
            CinefyKids - onde a imaginação ganha vida!</div>

          {/* titulo e descrição */}
          <h1 className="heroKidsTitle">
            Cada filme, uma nova <br /> aventura para descobrir!
          </h1>
          <p className="heroKidsDescription">
            Descubra os filmes que encantam corações e inspiram sonhos.
            Prepare a pipoca e venha viver aventuras incríveis com a família!
          </p>
        </div>

        {/* cards dos personagens */}
        <div className="heroKidsCardsWrapper">
          {cards.map((card) => (
            <div key={card.id} className={`heroKidsCard ${card.positionClass}`}>
              <div className="cardInner">
                <img src={card.image} alt={card.title} className="cardImage" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HeroSectionKids;
