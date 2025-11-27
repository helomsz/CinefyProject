import React from 'react';
import { Landmark } from 'lucide-react';
import './ProdutorasKids.css'; 

// importação das logos das produtoras
import DisneyLogo from '../../assets/cinefyKids/disney.png';
import PixarLogo from '../../assets/cinefyKids/pixar.png';
import DreamworksLogo from '../../assets/cinefyKids/dreamworks.png';
import UniversalLogo from '../../assets/cinefyKids/universal.png';
import CenturyLogo from '../../assets/cinefyKids/20.png';

// lista das produtoras com suas informações e logos
const produtoras = [
    { name: "Disney", filter_name: "Disney", logoSrc: DisneyLogo },
    { name: "Pixar", filter_name: "Pixar", logoSrc: PixarLogo },
    { name: "Dreamworks", filter_name: "DreamWorks", logoSrc: DreamworksLogo }, 
    { name: "Universal", filter_name: "Universal Pictures", logoSrc: UniversalLogo }, 
    { name: "20th Century Studios", filter_name: "20th Century Studios", logoSrc: CenturyLogo },
];

// componente principal que exibe as produtoras e gerencia o filtro
const ProdutorasKids = ({ onFilter, filtroAtivo }) => {

    // função que é chamada quando uma produtora é clicada, acionando o filtro
    const handleFilterClick = (producerFilterName) => {
        console.log(`Filtrar por Produtora: ${producerFilterName}`);
        if (onFilter) { 
             // chama a função onFilter passada por props com o nome da produtora
            onFilter(producerFilterName); 
        }
    };

    return (
        <section className="kids-section produtoras-section">
            <div className="produtoras-grid">
                {produtoras.map((produtora) => (
                    <div 
                        key={produtora.filter_name} 
                        className={`produtora-card ${filtroAtivo === produtora.filter_name ? 'ativo' : ''}`}
                        onClick={() => handleFilterClick(produtora.filter_name)}
                    >
                        <div className="produtora-logo-placeholder">
                            <img 
                                src={produtora.logoSrc} 
                                alt={`Logo ${produtora.name}`} 
                                className="produtora-logo-image" 
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ProdutorasKids;