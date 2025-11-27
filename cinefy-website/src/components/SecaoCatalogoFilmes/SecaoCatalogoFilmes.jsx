import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FilmeCardCatalogo from '../CardFilmeCatalogo/CardFilmeCatalogo';
import './SecaoCatalogoFilmes.css';

const API_URL_FILMES = 'http://localhost:8000/listar_filmes';

function SecaoCatalogoFilmes({ filmesFiltrados }) {
    // hook para navegação de páginas
    const navigate = useNavigate();
    const [filmes, setFilmes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // efeito para buscar os filmes da API assim que o componente for montado
    useEffect(() => {
        const fetchFilmes = async () => {
            setLoading(true);
            setError(null);

            try {
                // fazendo a requisição para a API
                const response = await fetch(API_URL_FILMES);

                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }

                const data = await response.json();

                //mapeia os dados 
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

    // se existem filmes filtrados, usa-os, senão, usa a lista completa de filmes da API
    const filmesExibidos = filmesFiltrados && filmesFiltrados.length > 0
        ? filmesFiltrados.map(f => ({
            id: f.id,
            titulo: f.titulo,
            genero: f.generos || f.genero || 'Gênero Desconhecido',
            posterCapa: f.poster || f.posterCapa,
        }))
        : filmes;

    // se estiver carregando, exibe uma mensagem de carregamento
    if (loading) {
        return (
            <section className="secaoFilmesWrapper loadingState">
                <p>Carregando filmes...</p>
            </section>
        );
    }

    // se ocorreu um erro na requisição, exibe a mensagem de erro
    if (error) {
        return (
            <section className="secaoFilmesWrapper loadingState" style={{ color: '#ff4d4d' }}>
                <p>{error}</p>
                <p className="debug-info">A rota esperada é: {API_URL_FILMES}</p>
            </section>
        );
    }

    // se não houver filmes exibidos, mostra uma mensagem informando que não há filmes com os filtros aplicados
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
                {/* mapeia cada filme e exibe o Card de cada um */}
                {filmesExibidos.map(filme => (
                    <FilmeCardCatalogo
                        key={filme.id}
                        titulo={filme.titulo}
                        genero={filme.genero}
                        posterCapa={filme.posterCapa}
                        onClick={() => navigate(`/detalhes/${filme.id}`)} // navega para tela de detalhes específicos do filme
                    />
                ))}
            </div>
        </section>
    );
}

export default SecaoCatalogoFilmes;
