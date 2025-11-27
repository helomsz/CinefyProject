import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader } from 'lucide-react';
import './MovieSearch.css';

const API_URL = "http://localhost:8000"; 

// hook de debounce para evitar chamadas constantes a API
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
    const abortRef = useRef(null); 

    const debouncedSearchTerm = useDebounce(termoPesquisa, 300);

    // fecha o dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);

    }, []);

    // realiza a busca com debounce
    useEffect(() => {
        if (debouncedSearchTerm.length > 1) {
            fetchMovies(debouncedSearchTerm); // chama a função de busca
        } else {
            setResultados([]);
            setIsLoading(false);
        }

        if (debouncedSearchTerm.length > 0) {
            setIsOpen(true);
        }

        return () => {
            if (abortRef.current) {
                abortRef.current.abort();
            }
        };

    }, [debouncedSearchTerm]);

    // função para buscar filmes na API
    const fetchMovies = async (query) => {

        if (abortRef.current) {
            abortRef.current.abort();
        }

        const controller = new AbortController(); // cria um controlador de requisição
        abortRef.current = controller;

        setIsLoading(true); // ativa o estado de carregamento

        try {
            const response = await fetch(
                `${API_URL}/api/buscar-rapido?q=${encodeURIComponent(query)}`,
                { signal: controller.signal } // passa o sinal de controle para cancelar requisições
            );

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            setResultados(data);

        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }

            console.error("Falha na busca:", error);
            setResultados([]);
        } finally {
            setIsLoading(false);
        }
    };

    // atualiza o termo de pesquisa com cada digitação
    const handleChange = (event) => {
        const value = event.target.value;
        setTermoPesquisa(value);
        if (value.length === 0) {
            setResultados([]);
        }
    };

    // alterna a visibilidade do dropdown de resultados
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

                {/* botão para abrir ou fechar a pesquisa */}
                <button 
                    className="botaoPesquisa" 
                    onClick={handleToggle}
                    aria-label="Abrir ou fechar busca"
                >
                    <Search className="iconeMenu" style={{ width: '29px', height: '29px', color: 'white' }} />
                </button>
            </div>

            {/* exibe os resultados da pesquisa */}
            {isOpen && termoPesquisa.length > 1 && (
                <div className="dropdownResultados">

                    {isLoading && (
                        <div className="statusMensagem loading">
                            <Loader className="loading-icon" style={{ animation: 'spin 1s linear infinite' }} />
                            <p>Carregando...</p>
                        </div>
                    )}

                    {/* exibe mensagem caso não haja filmes encontrados */}
                    {!isLoading && resultados.length === 0 && (
                        <p className="statusMensagem">Nenhum filme encontrado.</p>
                    )}

                    {/* mostra os filmes que foram encontrados*/}
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
