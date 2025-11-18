import React, { useState, useEffect } from 'react';
import CardProgresso from './CardProgresso/CardProgresso';
// import ModalTrailer from '../ModalTrailer/ModalTrailer'; // ❌ REMOVIDO: O modal está dentro do CardProgresso
import './SecaoContinueAssistindo.css';

// URL corrigida, apontando para a rota de listagem de progresso no backend.
const API_PROGRESSO_URL = 'http://localhost:8000/api/continue-assistindo'; 

function SecaoContinueAssistindoContainer() { 
    
    const [listaProgresso, setListaProgresso] = useState([]); 
    const [carregando, setCarregando] = useState(true); 
    const [erro, setErro] = useState(null); 

    useEffect(() => {
        const buscarProgresso = async () => {
            try {
                const response = await fetch(API_PROGRESSO_URL);

                if (!response.ok) {
                    throw new Error(`Erro ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                setListaProgresso(data); 
            } catch (error) {
                console.error("Erro na busca de progresso:", error);
                setErro(error.message);
            } finally {
                setCarregando(false);
            }
        };

        buscarProgresso();
    }, []); 

    // ❌ REMOVIDO: Toda a lógica e estados relacionados ao modal:
    // const [trailerAtivo, setTrailerAtivo] = useState(null); 
    // const handlePlayClick = (filme) => { /* ... */ };
    // const fecharTrailer = () => { /* ... */ };

    // 4. FEEDBACK AO USUÁRIO
    if (carregando) {
        return <p className="secaoCarregando">Carregando filmes em progresso...</p>;
    }

    if (erro) {
        return <p className="secaoErro">Erro ao carregar a seção: {erro}. Verifique se o backend Python está rodando e se a porta 8000 está liberada.</p>;
    }
    
    if (listaProgresso.length === 0) {
        // Seção vazia
        return null;
    }

    // 5. RENDERIZAÇÃO
    return (
        <section className="secaoConteudoCatalogo">
            <header className="secaoHeaderCatalogo">
                <h2 className="secaoTituloCatalogo">Continue Assistindo</h2>
            </header>
            
            <div className="listaConteudoCatalogo">
                {listaProgresso.map(filme => (
                    <CardProgresso 
                        key={filme.id} 
                        filme={filme} 
                        // A função onPlayClick agora só deve lidar com a navegação para a página do filme.
                        // O modal do trailer será aberto pelo botão de play dentro do próprio CardProgresso.
                        onPlayClick={() => console.log(`Navegar para o filme ${filme.titulo}`)} 
                    />
                ))}
            </div>

            {/* ❌ REMOVIDO: A renderização do ModalTrailer */}
            {/* {trailerAtivo && (
                <ModalTrailer 
                    trailerUrl={trailerAtivo} 
                    onClose={fecharTrailer} 
                />
            )} */}
        </section>
    );
}

export default SecaoContinueAssistindoContainer;