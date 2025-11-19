import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Star, Plus, Volume2, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { useUserSession } from '../../components/useUserSession';
import { FaTimes } from 'react-icons/fa'; // IMPORTAÇÃO ADICIONAL

// Assumindo que você tem os seguintes componentes e estilos
import NavbarCentralizada from '../../components/NavbarCentralizada/NavbarCentralizada.jsx';
import MenuLateral from '../../components/MenuLateral/MenuLateral.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import PageTransitionLoader from '../../components/PageTransitionLoader/PageTransitionLoader.jsx';
import './DetalhesFilme.css'; // Estilos necessários

const API_BASE_URL = 'http://localhost:8000';

const DetalhesFilme = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [filme, setFilme] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const { user, token, isLoggedIn, isLoading: isLoadingSession } = useUserSession();

    const isAdmin = !isLoadingSession && user?.role === 'admin';

    // --- INÍCIO: ESTADO PARA MODAL ---
    const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

    const handleOpenTrailerModal = () => {
        if (filme?.trailer) {
            setIsTrailerModalOpen(true);
        } else {
            alert("Trailer indisponível.");
        }
    };

    const handleCloseTrailerModal = () => {
        setIsTrailerModalOpen(false);
    };
    // --- FIM: ESTADO PARA MODAL ---

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const buscarFilme = async () => {
            setCarregando(true);
            setErro('');

            try {
                const response = await fetch(`${API_BASE_URL}/filme/detalhes/${id}`, {
                    signal,
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        setErro('Filme não encontrado.');
                    } else {
                        throw new Error(`Erro na rede ou servidor: Status ${response.status}`);
                    }
                    return;
                }

                const data = await response.json();
                if (data && data.filme) {
                    setFilme(data.filme);
                } else if (data) {
                    setFilme(data);
                } else {
                    throw new Error("Formato de resposta inesperado.");
                }

            } catch (error) {
                if (error.name === "AbortError") {
                    console.log("🔹 Requisição de detalhes cancelada ao sair da página.");
                    return;
                }
                console.error("Erro ao buscar detalhes do filme:", error.message);
                setErro('Não foi possível carregar os detalhes do filme. Tente novamente.');
            } finally {
                setCarregando(false);
            }
        };

        if (id) {
            buscarFilme();
        }

        return () => controller.abort();
    }, [id]);


    const handleDeleteFilme = async () => {
        if (!window.confirm(`Tem certeza que deseja deletar o filme "${filme.titulo}"? Esta ação não pode ser desfeita.`)) {
            return;
        }

        if (!isAdmin || !token) {
            alert("Ação não permitida. Você precisa ser um administrador.");
            return;
        }

        setIsDeleting(true);
        setErro('');

        try {
            const response = await fetch(`${API_BASE_URL}/filme/deletar/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.mensagem || `Erro ${response.status} ao deletar.`);
            }

            if (data.status === 'sucesso') {
                alert("Filme deletado com sucesso!");
                navigate('/');
            } else {
                throw new Error(data.mensagem || 'Erro desconhecido ao deletar.');
            }

        } catch (err) {
            console.error("Falha na operação de deleção:", err);
            setErro(err.message);
            alert(`Falha ao deletar: ${err.message}`);
        } finally {
            setIsDeleting(false);
        }
    };



    if (carregando || isLoadingSession) {
        return <PageTransitionLoader />;
    }

    if (erro) {
        return <div className="detalhes__erro">{erro}</div>;
    }

    if (!filme) {
        return <div className="detalhes__erro">Detalhes do filme indisponíveis.</div>;
    }

    // --- Preparação de dados (Seu código original) ---
    const diretores = filme.diretores ? filme.diretores.split(',') : [];
    const produtoras = filme.produtoras ? filme.produtoras.split(',') : [];
    const generos = filme.generos ? filme.generos.split(' | ') : [];
    const elenco = filme.elenco_completo || [];
    const backgroundStyle = {
        backgroundImage: `url(${filme.background || '/caminho/para/imagem/default.jpg'})`,
    };

    // --- Renderização do Detalhe ---
    return (
        <div className="detalhes-page-container">
            <MenuLateral />

            <div className="main-content-wrapper">
                <NavbarCentralizada />

                <main className="detalhes-main" key={id}>
                    <section className="detalhes__hero" style={backgroundStyle}>
                        <button
                            className="btn-voltar-hero"
                            onClick={() => {
                                setFilme(null); // Resetando o estado ao voltar
                                navigate(-1);
                            }}
                            title="Voltar"
                        >
                            <ArrowLeft size={24} color="#f0f6f9" />
                        </button>


                        {isLoggedIn && (
                            <div className="admin-actions-container">


                                <button
                                    className="btn-edit-hero"
                                    onClick={() => navigate(`/editar/${id}`)}
                                    title="Sugerir Edição"
                                >
                                    <Pencil size={25} color="#f0f6f9" />
                                </button>

                                {isAdmin && (
                                    <button
                                        className="btn-delete-hero"
                                        onClick={handleDeleteFilme}
                                        disabled={isDeleting}
                                        title="Deletar Filme (Admin)"
                                    >
                                        {isDeleting ? (
                                            <Loader size={25} color="#f0f6f9" className="spin" />
                                        ) : (
                                            <Trash2 size={25} color="#f0f6f9" />
                                        )}
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="detalhes__overlay"></div>
                        <div className="detalhes__content-wrapper">
                            {/* 1. POSTER */}
                            {filme.poster && (
                                <img
                                    src={filme.poster}
                                    alt={`Poster de ${filme.titulo}`}
                                    className="detalhes__poster"
                                />
                            )}
                            <div className="detalhes__content">
                                <div className="detalhes__header">
                                    <h1 className="detalhes__titulo">{filme.titulo}</h1>
                                    <div className="detalhes__info-geral">
                                        <span className="info-item">{filme.ano}</span>
                                        <span className="info-item">{filme.duracao_formatada}</span>
                                        <span className="info-item rating">
                                            <Star size={16} fill="#ffffffff" color="#ffffffff" /> {filme.avaliacao_media}
                                        </span>
                                    </div>
                                </div>

                                <div className="detalhes__acoes">
                                    <button className="btn-primary" onClick={handleOpenTrailerModal}>
                                        <Play size={20} fill="#ffffffff" color="#ffffffff" /> Assistir Trailer
                                    </button>
                                </div>

                                <p className="detalhes__sinopse">{filme.sinopse}</p>

                            </div>
                        </div>
                    </section>

                    <div className="detalhes__metadados-e-elenco">
                        <div className="detalhes__metadados">
                            <div className="metadado-item">
                                <strong>Diretor</strong>
                                {diretores.map((d, i) => <span key={i} className="badge-nome">{d.trim()}</span>)}
                            </div>
                            <div className="metadado-item">
                                <strong>Produtora</strong>
                                {produtoras.map((p, i) => <span key={i} className="badge-nome">{p.trim()}</span>)}
                            </div>
                            <div className="metadado-item">
                                <strong>Gênero</strong>
                                {generos.map((g, i) => <span key={i} className="badge-genero">{g.trim()}</span>)}
                            </div>
                        </div>

                        <div className="detalhes__elenco">
                            <h2>Elenco Principal</h2>
                            <div className="elenco__lista">
                                {elenco.map((ator, index) => (
                                    <div key={index} className="elenco__ator">
                                        {ator.fotoAtor ? (
                                            <img
                                                src={ator.fotoAtor}
                                                alt={ator.nome}
                                                className="ator__imagem"
                                            />
                                        ) : (
                                            <div className="ator__imagem-placeholder"></div>
                                        )}
                                        <span className="ator__nome">{ator.nome}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>

                {/* --- MODAL DO TRAILER --- */}
                {isTrailerModalOpen && filme?.trailer && (
                    <div className="modalOverlay" onClick={handleCloseTrailerModal}>
                        <div className="modalContent" onClick={e => e.stopPropagation()}>
                            <div className="modalHeader">
                                <h4 className="modalTitle">
                                    <span className="modalTitleLabel">Trailer</span>
                                    <span className="modalTitleContent">{filme.titulo} | {filme.ano}</span>
                                </h4>
                                <button className="modalCloseButton" onClick={handleCloseTrailerModal}>
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="iframeContainer">
                                <iframe
                                    src={`https://www.youtube.com/embed/${filme.trailer}?autoplay=1&rel=0`}
                                    title={`${filme.titulo} Trailer`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    </div>
                )}

                <div className="footerDetalhesWrapper">
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default DetalhesFilme;
