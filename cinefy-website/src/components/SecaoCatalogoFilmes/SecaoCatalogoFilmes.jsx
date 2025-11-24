import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FilmeCardCatalogo from '../CardFilmeCatalogo/CardFilmeCatalogo'; 
import './SecaoCatalogoFilmes.css';

const API_URL_FILMES = 'http://localhost:8000/listar_filmes';

function SecaoCatalogoFilmes({ filmesFiltrados }) {
    const navigate = useNavigate();
    const [filmes, setFilmes] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFilmes = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(API_URL_FILMES);

                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }

                const data = await response.json();

                const filmesMapeados = data.map(filme => ({
                    id: filme.id,
                    titulo: filme.titulo || 'Filme Sem Título',
                    genero: filme.generos || 'Gênero Desconhecido', 
                    posterCapa: filme.poster, 
                }));

                setFilmes(filmesMapeados);
                
            } catch (err) {
                console.error("Erro ao buscar filmes da API:", err);
                setError(`Falha ao carregar catálogo: ${err.message}. Verifique a URL (${API_URL_FILMES}) e se o servidor Python está ativo.`);
            } finally {
                setLoading(false);
            }
        };

        fetchFilmes();
        
    }, []); 


    const filmesExibidos = filmesFiltrados && filmesFiltrados.length > 0
        ? filmesFiltrados.map(f => ({
            id: f.id,
            titulo: f.titulo,
            genero: f.generos || f.genero || 'Gênero Desconhecido',
            posterCapa: f.poster || f.posterCapa,
        }))
        : filmes;

    if (loading) {
        return (
            <section className="secaoFilmesWrapper loadingState">
                <p>Carregando filmes...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="secaoFilmesWrapper loadingState" style={{color: '#ff4d4d'}}>
                <p>{error}</p>
                <p className="debug-info">A rota esperada é: {API_URL_FILMES}</p>
            </section>
        );
    }

    if (filmesExibidos.length === 0) {
        return (
            <section className="secaoFilmesWrapper loadingState">
                <p>Nenhum filme encontrado com os filtros aplicados.</p>
            </section>
        );
    }

    return (
        <section className="secaoFilmesWrapper">
            <div className="filmesGrid">
                {filmesExibidos.map(filme => (
                    <FilmeCardCatalogo 
                        key={filme.id}
                        titulo={filme.titulo}
                        genero={filme.genero}
                        posterCapa={filme.posterCapa} 
                        onClick={() => navigate(`/detalhes/${filme.id}`)}
                    />
                ))}
            </div>
        </section>
    );
}

export default SecaoCatalogoFilmes;
