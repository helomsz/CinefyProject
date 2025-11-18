import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader } from 'lucide-react';
import './MovieSearch.css';

const API_URL = "http://localhost:8000"; 

// HOOK de debounce
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};


function MovieSearch() {
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [resultados, setResultados] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const searchRef = useRef(null);
    const abortRef = useRef(null); // ← controlador para abortar buscas antigas

    const debouncedSearchTerm = useDebounce(termoPesquisa, 300);

    // Fecha o dropdown quando clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);

    }, []);

    // Faz a busca quando o termo debounced mudar
    useEffect(() => {
        if (debouncedSearchTerm.length > 1) {
            fetchMovies(debouncedSearchTerm);
        } else {
            setResultados([]);
            setIsLoading(false);
        }

        if (debouncedSearchTerm.length > 0) {
            setIsOpen(true);
        }

        // 🔥 Cancela requisição se o termo mudar ou se o componente desmontar
        return () => {
            if (abortRef.current) {
                abortRef.current.abort();
            }
        };

    }, [debouncedSearchTerm]);

    // 🔥 Função corrigida de fetch com AbortController
    const fetchMovies = async (query) => {

        // Se já existir uma requisição anterior → cancela
        if (abortRef.current) {
            abortRef.current.abort();
        }

        const controller = new AbortController();
        abortRef.current = controller;

        setIsLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/buscar-rapido?q=${encodeURIComponent(query)}`,
                { signal: controller.signal }
            );

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            setResultados(data);

        } catch (error) {
            if (error.name === "AbortError") {
                // Cancelamento normal — não é erro
                return;
            }

            console.error("Falha na busca:", error);
            setResultados([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (event) => {
        const value = event.target.value;
        setTermoPesquisa(value);
        if (value.length === 0) {
            setResultados([]);
        }
    };

    const handleToggle = () => {
        if (isOpen && termoPesquisa.length === 0) {
            setIsOpen(false);
        } else {
            setIsOpen(true);
        }
    };

    return (
        <div ref={searchRef} className="searchComponent">

            <div className={`areaPesquisa ${isOpen ? 'aberta' : 'fechada'}`}>
                {isOpen && (
                    <input
                        type="text"
                        placeholder="Buscar filmes..."
                        value={termoPesquisa}
                        onChange={handleChange}
                        autoFocus={isOpen}
                        onFocus={() => setIsOpen(true)}
                    />
                )}

                <button 
                    className="botaoPesquisa" 
                    onClick={handleToggle}
                    aria-label="Abrir ou fechar busca"
                >
                    <Search className="iconeMenu" style={{ width: '29px', height: '29px', color: 'white' }} />
                </button>
            </div>

            {isOpen && termoPesquisa.length > 1 && (
                <div className="dropdownResultados">

                    {isLoading && (
                        <div className="statusMensagem loading">
                            <Loader className="loading-icon" style={{ animation: 'spin 1s linear infinite' }} />
                            <p>Carregando...</p>
                        </div>
                    )}

                    {!isLoading && resultados.length === 0 && (
                        <p className="statusMensagem">Nenhum filme encontrado.</p>
                    )}

                    {!isLoading && resultados.length > 0 && (
                        <ul className="listaFilmesResultados">
                            {resultados.map(filme => (
                                <li key={filme.id} className="itemResultadoFilme">
                                    <a 
                                        href={`/detalhes/${filme.id}`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <img
                                            src={filme.poster}
                                            alt={filme.titulo}
                                            className="capaMini"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://placehold.co/40x60/333/FFFFFF?text=??";
                                            }}
                                        />
                                        <div className="infoResultado">
                                            <span className="tituloResultado">{filme.titulo}</span>
                                            {filme.ano && <span className="anoResultado">({filme.ano})</span>}
                                        </div>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default MovieSearch;
