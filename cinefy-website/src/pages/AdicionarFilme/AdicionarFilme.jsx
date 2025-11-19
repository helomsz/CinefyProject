import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {Film,Link,Tag,Users,Check,Plus,Trash2,Send,Zap} from "lucide-react";
import NavbarCentralizada from "../../components/NavbarCentralizada/NavbarCentralizada";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import Footer from "../../components/Footer/Footer";
import { useUserSession } from "../../components/useUserSession";
import PageTransitionLoader from "../../components/PageTransitionLoader/PageTransitionLoader";

const ACTOR_LIMIT = 3;
const API_BASE_URL = "http://localhost:8000";

const allCategories = [
  "Ficção",
  "Ação",
  "Drama",
  "Terror",
  "Fantasia",
  "Animação",
  "Aventura",
  "Comédia",
  "Romance",
  "Suspense",
  "Super-Herói",
  "Distopia",
  "Musical",
  "Esporte",
  "Infantil",
  "Crime",
];

const initialFormData = {
  titulo: "",
  sinopse: "",
  tempo_duracao: "",
  ano: "",
  url_poster: "",
  url_banner: "",
  codigo_trailer: "",
  categorias: [],
  diretor: "",
  produtora: "",
  atores: [],
};

const AdicionarFilme = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [novoAtor, setNovoAtor] = useState("");

  const [diretoresDb, setDiretoresDb] = useState([]);
  const [produtorasDb, setProdutorasDb] = useState([]);
  const [atoresDb, setAtoresDb] = useState([]);

  const {
    user,
    token,
    isLoggedIn,
    isLoading: isLoadingSession,
  } = useUserSession();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  const buttonText = isAdmin
    ? "Adicionar Filme Imediatamente"
    : "Enviar Solicitação";

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [diretoresRes, produtorasRes, atoresRes] = await Promise.all([
          fetch(`${API_BASE_URL}/diretores`),
          fetch(`${API_BASE_URL}/produtoras`),
          fetch(`${API_BASE_URL}/atores`),
        ]);

        if (!diretoresRes.ok || !produtorasRes.ok || !atoresRes.ok) {
          throw new Error("Erro ao buscar dados do backend");
        }

        setDiretoresDb(await diretoresRes.json());
        setProdutorasDb(await produtorasRes.json());
        setAtoresDb(await atoresRes.json());
      } catch (error) {
        console.error("Erro ao carregar dados do back-end:", error);
        alert("Falha ao carregar dados do servidor.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (category) => {
    setFormData((prev) => {
      const isSelected = prev.categorias.includes(category);

      if (isSelected) {
        return {
          ...prev,
          categorias: prev.categorias.filter((c) => c !== category),
        };
      }

      if (prev.categorias.length < 2) {
        return { ...prev, categorias: [...prev.categorias, category] };
      }

      return prev;
    });
  };

  const addActorFromSuggestion = (actor) => {
    if (
      actor &&
      actor.id &&
      formData.atores.length < ACTOR_LIMIT &&
      !formData.atores.some((a) => a.id === actor.id)
    ) {
      setFormData((prev) => ({
        ...prev,
        atores: [...prev.atores, actor],
      }));
      setNovoAtor("");
    }
  };

  const handleRemoveActor = (actorToRemove) => {
    setFormData((prev) => ({
      ...prev,
      atores: prev.atores.filter((actor) => actor.id !== actorToRemove.id),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isLoggedIn || !token) {
      alert("Você precisa estar logado para enviar.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/filme/adicionar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || "Falha ao enviar solicitação.");
      }

      alert(data.mensagem);
      navigate("/");
    } catch (error) {
      console.error("Erro no handleSubmit:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData || isLoadingSession) {
    return <PageTransitionLoader />;
  }

  if (!isLoggedIn) {
    return (
      <div className="add-movie-page">
        <MenuLateral />
        <NavbarCentralizada />
        <div className="centered-message-container">
          <div className="access-denied-card">
            <Zap size={48} className="icon-denied" />
            <h1 className="denied-title">Acesso Negado</h1>
            <p className="denied-message">
              Você precisa estar logado para acessar esta página.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="denied-login-button"
            >
              Ir para Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categoryLimitReached = formData.categorias.length >= 2;
  const actorLimitReached = formData.atores.length >= ACTOR_LIMIT;

  const sugestoesAtores = atoresDb
    .filter((actor) => !formData.atores.some((a) => a.id === actor.id))
    .filter(
      (actor) =>
        novoAtor && actor.nome.toLowerCase().includes(novoAtor.toLowerCase())
    );

  return (
    <div className="add-movie-page">
      <MenuLateral />
      <NavbarCentralizada />

      <div className="main-content">
        <div className="preview-area">
          <div className="poster-preview">
            {formData.url_poster ? (
              <img
                src={formData.url_poster}
                alt={`Poster de ${formData.titulo}`}
                className="preview-image poster-img"
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <p className="preview-text">Pré-visualização do Poster</p>
            )}
          </div>

          <div className="banner-preview">
            {formData.url_banner ? (
              <img
                src={formData.url_banner}
                alt={`Banner de ${formData.titulo}`}
                className="preview-image banner-img"
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <p className="preview-text">Pré-visualização do Banner</p>
            )}
          </div>
        </div>

        <div className="form-container">
          <form className="movie-form" onSubmit={handleSubmit}>
            <header>
              <p className="subtitle-header">Personalize sua experiência!</p>
              <h1 className="title-header">Adicionar novo filme</h1>
            </header>

            {loadingData ? (
              <div className="loading-message">
                <Zap size={24} className="spin-icon" /> Carregando dados do
                servidor...
              </div>
            ) : (
              <>
                <div className="form-group full-width input-card">
                  <label htmlFor="titulo">Título do Filme</label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Digite o título do filme"
                    required
                  />
                </div>

                <div className="form-group full-width input-card">
                  <label htmlFor="sinopse">Sinopse</label>
                  <textarea
                    id="sinopse"
                    name="sinopse"
                    value={formData.sinopse}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Escreva a sinopse do filme"
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group input-card">
                    <label htmlFor="tempo_duracao">
                      Tempo de duração (min)
                    </label>
                    <input
                      type="number"
                      id="tempo_duracao"
                      name="tempo_duracao"
                      value={formData.tempo_duracao}
                      onChange={handleChange}
                      placeholder="Ex: 142"
                    />
                  </div>

                  <div className="form-group input-card">
                    <label htmlFor="ano">Ano</label>
                    <input
                      type="number"
                      id="ano"
                      name="ano"
                      value={formData.ano}
                      onChange={handleChange}
                      placeholder="Ex: 2014"
                    />
                  </div>
                </div>

                <div className="form-group full-width input-card">
                  <label htmlFor="url_poster" className="label-with-icon-add">
                    <Link size={16} /> URL poster
                  </label>
                  <input
                    type="url"
                    id="url_poster"
                    name="url_poster"
                    value={formData.url_poster}
                    onChange={handleChange}
                    placeholder="Insira a url do poster do filme"
                    required
                  />
                </div>

                <div className="form-group full-width input-card">
                  <label htmlFor="url_banner" className="label-with-icon-add">
                    <Link size={16} /> URL banner
                  </label>
                  <input
                    type="url"
                    id="url_banner"
                    name="url_banner"
                    value={formData.url_banner}
                    onChange={handleChange}
                    placeholder="Insira a url do banner do filme"
                  />
                </div>

                <div className="form-group full-width input-card">
                  <label
                    htmlFor="codigo_trailer"
                    className="label-with-icon-add"
                  >
                    <Film size={16} /> Código do trailer (Youtube)
                  </label>
                  <input
                    type="text"
                    id="codigo_trailer"
                    name="codigo_trailer"
                    value={formData.codigo_trailer}
                    onChange={handleChange}
                    placeholder="Ex: C0RKGvBT9jw"
                  />
                </div>

                <div className="form-group full-width categories-section">
                  <h3 className="section-title">
                    <Tag size={16} /> Categoria (Max: 2)
                  </h3>

                  <div className="categories-list">
                    {allCategories.map((category) => {
                      const isSelected = formData.categorias.includes(category);
                      const isDisabled = categoryLimitReached && !isSelected;

                      return (
                        <button
                          key={category}
                          type="button"
                          className={`category-tag ${
                            isSelected ? "selected" : ""
                          }`}
                          onClick={() => handleCategoryToggle(category)}
                          disabled={isDisabled}
                        >
                          {isSelected && <Check size={14} />}
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group card-select">
                    <label className="label-with-icon">
                      <Users size={16} /> Diretor
                    </label>
                    <div className="select-wrapper">
                      <select
                        id="diretor"
                        name="diretor"
                        value={formData.diretor}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>
                          Selecione um diretor
                        </option>
                        {diretoresDb.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group card-select">
                    <label className="label-with-icon">
                      <Users size={16} /> Produtora
                    </label>
                    <div className="select-wrapper">
                      <select
                        id="produtora"
                        name="produtora"
                        value={formData.produtora}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>
                          Selecione uma produtora
                        </option>
                        {produtorasDb.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group full-width actors-section">
                  <h3 className="section-title">
                    <Users size={16} /> Atores Selecionados (
                    {formData.atores.length}/{ACTOR_LIMIT})
                  </h3>

                  {!actorLimitReached && (
                    <div className="autocomplete-container">
                      <div className="form-group card-select input-actor-search">
                        <label htmlFor="buscaAtor">
                          Buscar ou Adicionar Ator
                        </label>
                        <input
                          type="text"
                          id="buscaAtor"
                          value={novoAtor}
                          onChange={(e) => setNovoAtor(e.target.value)}
                          placeholder="Digite o nome para buscar..."
                        />
                      </div>

                      {novoAtor.length > 0 && (
                        <ul className="suggestions-list">
                          {sugestoesAtores.length > 0 ? (
                            sugestoesAtores.map((actor) => (
                              <li
                                key={actor.id}
                                onClick={() => addActorFromSuggestion(actor)}
                              >
                                {actor.nome} <Check size={14} />
                              </li>
                            ))
                          ) : (
                            <li
                              className="create-new-option"
                              onClick={() => {
                                alert(`Criar ator: ${novoAtor}`);
                                setNovoAtor("");
                              }}
                            >
                              <Plus size={16} /> Criar Novo Ator:{" "}
                              <b>{novoAtor}</b>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="actors-list">
                    {formData.atores.map((actor) => (
                      <div key={actor.id} className="actor-item selected-actor">
                        {actor.nome}
                        <button
                          type="button"
                          onClick={() => handleRemoveActor(actor)}
                          className="remove-actor-btn"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {actorLimitReached && (
                    <p className="limit-message">
                      Limite de {ACTOR_LIMIT} atores selecionados.
                    </p>
                  )}
                </div>

                <div className="form-group full-width submit-area">
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send size={24} /> {buttonText}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdicionarFilme;
