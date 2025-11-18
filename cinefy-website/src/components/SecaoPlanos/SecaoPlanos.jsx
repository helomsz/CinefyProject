import React from 'react';
import './SecaoPlanos.css';

import ImagemPlanos from '../../assets/planos/planos.png'; 

function SecaoPlanos() {
    return (
        <section className="secaoPlanos">
            <a 
                href="/pagamento" 
                className="linkPlanos"
                title="Clique para ver detalhes e assinar nossos planos"
            >
                <img 
                    src={ImagemPlanos} 
                    alt="Detalhes dos Planos de Assinatura: Grátis, Plus e Premium." 
                    className="imagemPlanos"
                />
            </a>
        </section>
    );
}

export default SecaoPlanos;