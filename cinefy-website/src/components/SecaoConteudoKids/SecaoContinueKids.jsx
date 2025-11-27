import React, { useState, useEffect } from 'react';
import CardContinue from './CardContinue/CardContinue.jsx'
import './SecaoContinueKids.css';

// define a URL da API para buscar os filmes em progresso
const API_PROGRESSO_URL = 'http://localhost:8000/api/listar_filmes_infantis'; 

function SecaoContinueKids() { 
    
    const [listaProgresso, setListaProgresso] = useState([]); 
    const [carregando, setCarregando] = useState(true); 
    const [erro, setErro] = useState(null); 

    useEffect(() => {
        const buscarProgresso = async () => {
            try {
                const response = await fetch(API_PROGRESSO_URL); // faz a requisição GET para a API

                if (!response.ok) { // verifica se a resposta foi bem-sucedida
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

        buscarProgresso();  // chama a função para buscar os filmes em progresso
    }, []); 

    if (carregando) {
        return <p className="secaoCarregando">Carregando filmes em progresso...</p>;
    }

    if (erro) {
        return <p className="secaoErro">Erro ao carregar a seção: {erro}. Verifique se o backend Python está rodando e se a porta 8000 está liberada.</p>;
    }
    
    if (listaProgresso.length === 0) { // se não houver filmes em progresso, retorna null e não exibe nada
        return null;
    }

    return (
        <section className="secaoConteudo">
            <header className="secaoHeader">
                <h2 className="secaoTitulo">Continue Assistindo</h2>
            </header>
            
            <div className="listaConteudo">
                {listaProgresso.map(filme => (
                    // mapeia os filmes em progresso e cria um CardProgresso para cada um
                    <CardContinue
                        key={filme.id} 
                        filme={filme} 
                        onPlayClick={() => console.log(`Navegar para o filme ${filme.titulo}`)} 
                    />
                ))}
            </div>
        </section>
    );
}

export default SecaoContinueKids;