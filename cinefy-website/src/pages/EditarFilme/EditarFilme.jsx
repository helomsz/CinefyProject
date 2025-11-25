import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {Film, LayoutList, Link, Zap, Tag, Users,Check, Plus, Trash2, Send, AlertCircle} from 'lucide-react';
import './EditarFilme.css';
import { useUserSession } from '../../components/useUserSession';

import NavbarCentralizada from '../../components/NavbarCentralizada/NavbarCentralizada';
import MenuLateral from '../../components/MenuLateral/MenuLateral';
import Footer from '../../components/Footer/Footer';
import PageTransitionLoader from '../../components/PageTransitionLoader/PageTransitionLoader.jsx';

const API_BASE_URL = 'http://localhost:8000';

const generoIdMap = {
    "Ficção": 1, "Ação": 2, "Drama": 3, "Terror": 4, "Fantasia": 5,
    "Animação": 6, "Aventura": 7, "Comédia": 8, "Romance": 9, "Suspense": 10,
    "Super-Herói": 11, "Distopia": 12, "Musical": 13, "Crime": 14,
    "Esporte": 15, "Infantil": 16
};

const allCategories = Object.keys(generoIdMap);

const initialEmptyFormData = {
    titulo: '',
    sinopse: '',
    tempo_duracao: '',
    ano: '',
    url_poster: '',
    url_banner: '',
    trailer: '',
    categorias: [],
    diretor_id: '',
    produtora_id: '',
    atores: []
};

const EditarFilme = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { user, token, isLoggedIn, isLoading: isLoadingSession } = useUserSession();
    const [formData, setFormData] = useState(initialEmptyFormData);
    const [newActor, setNewActor] = useState('');
    const [loading, setLoading] = useState(false);
    const [carregandoDados, setCarregandoDados] = useState(true);
    const [erro, setErro] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [diretores, setDiretores] = useState([]);
    const [produtoras, setProdutoras] = useState([]);

    const isAdmin = user?.role === 'admin';

    // -------- BUSCAR DADOS DO FILME -------------
    useEffect(() => {
        const buscarFilmeParaEdicao = async () => {
            setCarregandoDados(true);
            setErro('');

            try {
                const [resFilme, resDiretores, resProdutoras] = await Promise.all([
                    fetch(`${API_BASE_URL}/filme/detalhes/${id}`),
                    fetch(`${API_BASE_URL}/diretores`),
                    fetch(`${API_BASE_URL}/produtoras`)
                ]);

                if (!resFilme.ok) throw new Error(`Erro ao buscar filme`);
                if (!resDiretores.ok) throw new Error(`Erro ao buscar diretores`);
                if (!resProdutoras.ok) throw new Error(`Erro ao buscar produtoras`);

                const dataFilme = await resFilme.json();
                const listaDiretores = await resDiretores.json();
                const listaProdutoras = await resProdutoras.json();

                setDiretores(listaDiretores);
                setProdutoras(listaProdutoras);

                setFormData({
                    titulo: dataFilme.titulo || '',
                    sinopse: dataFilme.sinopse || '',
                    tempo_duracao: String(dataFilme.tempo_duracao || ''), 
                    ano: String(dataFilme.ano || ''), 
                    url_poster: dataFilme.poster || '',
                    url_banner: dataFilme.background || '',
                    trailer: dataFilme.trailer || '',
                    categorias: dataFilme.generos_nomes?.split(" | ").map(g => g.trim()).filter(g => g) || [],
                    diretor_id: String(dataFilme.diretor_id || ''), 
                    produtora_id: String(dataFilme.produtora_id || ''), 
                    atores: dataFilme.elenco_completo?.filter(a => a.nome) || []
                });

            } catch (e) {
                console.error(e);
                setErro("Erro ao carregar dados do filme.");
            } finally {
                setCarregandoDados(false);
            }
        };

        buscarFilmeParaEdicao();
    }, [id]);

    // -------- HANDLERS -------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryToggle = (cat) => {
        setFormData(prev => {
            const isSelected = prev.categorias.includes(cat);
            if (isSelected)
                return { ...prev, categorias: prev.categorias.filter(c => c !== cat) };

            if (prev.categorias.length < 2)
                return { ...prev, categorias: [...prev.categorias, cat] };

            return prev;
        });
    };

    const handleAddActor = () => {
        const trimmed = newActor.trim();
        if (trimmed && !formData.atores.includes(trimmed)) {
            setFormData(prev => ({
                ...prev,
                atores: [...prev.atores, trimmed]
            }));
            setNewActor('');
        }
    };

    const handleRemoveActor = (actor) => {
        setFormData(prev => ({
            ...prev,
            atores: prev.atores.filter(a => a !== actor)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        if (!isLoggedIn || !token) {
            setErrorMessage("Você precisa estar logado.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/filme/editar/${id}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.mensagem);

            alert(data.mensagem);
            navigate(`/detalhes/${id}`);

        } catch (err) {
            console.error(err);
            setErrorMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    // -------- LOADING / PROTEÇÃO -------------
    if (isLoadingSession || carregandoDados) return <PageTransitionLoader />;

    if (!isLoggedIn) {
        return (
            <div className="page-container-add">
                <MenuLateral />
                <div className="main-content">
                    <NavbarCentralizada />
                    <div className="form-container-add">
                        <h1>Acesso negado</h1>
                        <button onClick={() => navigate('/login')}>Login</button>
                    </div>
                </div>
            </div>
        );
    }

    const categoryLimitReached = formData.categorias.length >= 2;

    return (
        <div className="add-movie-page">
            <MenuLateral />
            <NavbarCentralizada />

            <div className="main-content">
                <div className="preview-area">
                    <div className="poster-preview">
                        {formData.url_poster ? (
                            <img src={formData.url_poster} alt="" />
                        ) : <p>Pré-visualização do Poster</p>}
                    </div>

                    <div className="banner-preview">
                        {formData.url_banner ? (
                            <img src={formData.url_banner} alt="" />
                        ) : <p>Pré-visualização do Banner</p>}
                    </div>
                </div>

                <div className="form-container">
                    <form className="movie-form-add" onSubmit={handleSubmit}>

                        {errorMessage && (
                            <div className="error-message">
                                <AlertCircle size={18} /> {errorMessage}
                            </div>
                        )}

                        <header>
                            <p className="subtitle-header">Personalize sua experiência!</p>
                            <h1 className="title-header">Editar {formData.titulo}</h1>
                        </header>

                        <div className="form-group full-width input-card">
                            <label>Título</label>
                            <input
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group full-width input-card">
                            <label>Sinopse</label>
                            <textarea
                                name="sinopse"
                                value={formData.sinopse}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-grid">
                            <div className="form-group input-card">
                                <label>Duração</label>
                                <input
                                    name="tempo_duracao"
                                    value={formData.tempo_duracao}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group input-card">
                                <label>Ano</label>
                                <input
                                    type="number"
                                    name="ano"
                                    value={formData.ano}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group full-width input-card">
                            <label><Link size={16} /> Poster</label>
                            <input
                                name="url_poster"
                                value={formData.url_poster}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group full-width input-card">
                            <label><Link size={16} /> Banner</label>
                            <input
                                name="url_banner"
                                value={formData.url_banner}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group full-width input-card">
                            <label><Film size={16} /> Trailer</label>
                            <input
                                name="trailer"
                                value={formData.trailer}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group full-width categories-section">
                            <h3><Tag size={16} /> Categorias</h3>
                            <div className="categories-list">
                                {allCategories.map(cat => {
                                    const selected = formData.categorias.includes(cat);
                                    const disabled = categoryLimitReached && !selected;

                                    return (
                                        <button
                                            key={cat}
                                            type="button"
                                            disabled={disabled}
                                            className={`category-tag ${selected ? 'selected' : ''}`}
                                            onClick={() => handleCategoryToggle(cat)}
                                        >
                                            {selected && <Check size={14} />}
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group input-card">
                                <label><Users size={16} /> Diretor</label>
                                <select
                                    name="diretor_id"
                                    value={formData.diretor_id}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Selecione</option>
                                    {diretores.map(d => (
                                        <option key={d.id} value={d.id}>{d.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group input-card">
                                <label><Users size={16} /> Produtora</label>
                                <select
                                    name="produtora_id"
                                    value={formData.produtora_id}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Selecione</option>
                                    {produtoras.map(p => (
                                        <option key={p.id} value={p.id}>{p.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group full-width actors-section">
                            <h3><Users size={16} /> Atores</h3>

                            {formData.atores.map((actor, i) => (
                                <div key={i} className="actor-item">
                                    <input
                                        value={actor.nome}
                                        onChange={(e) => {
                                            const list = [...formData.atores];
                                            list[i] = e.target.value;
                                            setFormData(prev => ({ ...prev, atores: list }));
                                        }}
                                    />
                                    <button type="button" onClick={() => handleRemoveActor(actor)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}

                        </div>

                        <div className="form-group full-width submit-area">
                            <button type="submit" disabled={loading} className="submit-button-add">
                                {loading ? "Salvando..." : "Salvar alterações"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditarFilme;