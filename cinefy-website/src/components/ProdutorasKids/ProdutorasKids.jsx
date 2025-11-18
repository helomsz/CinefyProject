import React from 'react';
import { Landmark } from 'lucide-react';
import './ProdutorasKids.css'; 

// 1. Variáveis de importação (OK)
import DisneyLogo from '../../assets/cinefyKids/disney.png';
import PixarLogo from '../../assets/cinefyKids/pixar.png';
import DreamworksLogo from '../../assets/cinefyKids/dreamworks.png';
import UniversalLogo from '../../assets/cinefyKids/universal.png';
import CenturyLogo from '../../assets/cinefyKids/20.png';

const produtoras = [
    // 2. Mapeamento da imagem (logoSrc) para o objeto da produtora
    { name: "Disney", filter_name: "Disney", logoSrc: DisneyLogo },
    { name: "Pixar", filter_name: "Pixar", logoSrc: PixarLogo },
    // Mantemos o 'filter_name' que funcionou (DreamWorks e Universal Pictures)
    { name: "Dreamworks", filter_name: "DreamWorks", logoSrc: DreamworksLogo }, 
    { name: "Universal", filter_name: "Universal Pictures", logoSrc: UniversalLogo }, 
    { name: "20th Century Studios", filter_name: "20th Century Studios", logoSrc: CenturyLogo },
];

// O 'onFilter' é a função de callback da página principal, e 'filtroAtivo' é o nome da produtora selecionada.
const ProdutorasKids = ({ onFilter, filtroAtivo }) => {
    
    // Função para lidar com o clique
    const handleFilterClick = (producerFilterName) => {
        console.log(`Filtrar por Produtora: ${producerFilterName}`);
        if (onFilter) { 
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
                        {/* 3. Substituímos o placeholder de texto pela tag <img> */}
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