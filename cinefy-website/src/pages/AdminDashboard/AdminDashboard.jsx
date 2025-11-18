import React, { useEffect, useState, useCallback } from "react";
import {
  Check,
  X,
  Film,
  LayoutList,
  Users,
  Clock,
  Home,
  LogOut,
  Settings,
  Loader,
} from "lucide-react";
import "./AdminDashboard.css";
import NavbarCentralizada from "../../components/NavbarCentralizada/NavbarCentralizada";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import Footer from "../../components/Footer/Footer";

const API_BASE_URL = "http://localhost:8000";

const useNavigate = () => {
  return useCallback((path) => {
    console.warn(`[NAVEGAÇÃO MOCK] Redirecionando para: ${path}`);
  }, []);
};

const useAuth = () => {
  const [userRole, setUserRole] = useState(undefined);
  const [token, setToken] = useState(undefined);
  const navigate = useNavigate();

  const login = useCallback(
    (role = "admin", tokenValue = "mock-jwt-token-admin") => {
      localStorage.setItem("role", role);
      localStorage.setItem("token", tokenValue);
      setUserRole(role);
      setToken(tokenValue);
      navigate("/");
    },
    [navigate, setUserRole, setToken]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    setUserRole(null);
    setToken(null);
    navigate("/login");
  }, [navigate, setUserRole, setToken]);

  useEffect(() => {
    let role = localStorage.getItem("role");
    let jwtToken = localStorage.getItem("token");

    if (role === "undefined") role = null;
    if (jwtToken === "undefined") jwtToken = null;

    setUserRole(role);
    setToken(jwtToken);
  }, []);

  return {
    userRole,
    isAdmin: userRole === "admin",
    token,
    login,
    logout,
  };
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userRole, isAdmin, token, login, logout } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchSolicitacoes = useCallback(async () => {
    if (!token) {
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/solicitacoes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.mensagem || `Erro ${response.status} ao buscar dados.`
        );
      }

      const data = await response.json();
      setSolicitacoes(data);
    } catch (err) {
      console.error("Erro na busca de solicitações:", err);
      setError(err.message);
    } finally {
      setIsLoadingData(false);
    }
  }, [token]);

  const handleProcessRequest = useCallback(
    async (solicitacaoId, acao) => {
      if (!token || processingId) return;

      setProcessingId(solicitacaoId);
      setError(null);

      const endpoint =
        acao === "APROVAR"
          ? `/admin/solicitacao/aprovar/${solicitacaoId}`
          : `/admin/solicitacao/rejeitar/${solicitacaoId}`;

      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.mensagem || "Falha ao processar solicitação.");
        }

        alert(data.mensagem);
        setSolicitacoes((prev) => prev.filter((s) => s.id !== solicitacaoId));
      } catch (err) {
        console.error(`Erro ao ${acao} solicitação:`, err);
        setError(err.message);
      } finally {
        setProcessingId(null);
      }
    },
    [token, processingId]
  );

  useEffect(() => {
    if (userRole === undefined) return;

    if (!isAdmin || !token) {
      logout();
      return;
    }

    if (isAdmin && token) fetchSolicitacoes();
  }, [userRole, isAdmin, token, navigate, fetchSolicitacoes, logout]);

  if (userRole === undefined) {
    return (
      <div className="verificandoPermissoesContainer">
        <div className="verificandoPermissoesMensagem">
          Verificando permissões...
        </div>

        <button
          onClick={() => login("admin", "mock-jwt-token-admin")}
          className="botaoLoginTeste"
        >
          Logar como Admin (Teste)
        </button>
      </div>
    );
  }

  if (!isAdmin) return null;

  if (isLoadingData) {
    return (
      <div className="carregandoSolicitacoesContainer">
        <div className="carregandoSolicitacoesMensagem">
          Carregando solicitações...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboardContainer">
      <MenuLateral />

      {/* NOVA ÁREA PRINCIPAL EM COLUNA */}
      <div className="dashboardAreaPrincipal">
        <NavbarCentralizada />

        <main className="dashboardConteudo">
          <header className="dashboardCabecalho">
            <p className="dashboardSaudacao">Bem vinda de volta, Mariany</p>
            <h1 className="dashboardTitulo">Dashboard de Administração</h1>
          </header>

          {error && (
            <div className="mensagemErroGlobal">
              <strong>Erro:</strong> {error}
            </div>
          )}

          <section className="dashboardGrade">
            <StatCard
              icon={Film}
              value="65"
              label="Filmes no Catálogo"
              color="cartaoEstatisticaVermelho"
            />

            <StatCard
              icon={Users}
              value="250"
              label="Usuários Premium"
              color="cartaoEstatisticaAzul"
            />

            <StatCard
              icon={Clock}
              value={solicitacoes.length}
              label="Solicitações Pendentes"
              color="cartaoEstatisticaAmarelo"
            />

            <div className="listaSolicitacoesContainer">
              <div className="listaSolicitacoesWrapper">
                <h2 className="listaSolicitacoesTitulo">
                  <Clock size={20} className="listaSolicitacoesIcone" />
                  Gerenciador de Solicitações ({solicitacoes.length})
                </h2>

                <div className="listaSolicitacoesItens">
                  {solicitacoes.length > 0 ? (
                    solicitacoes.map((sol) => (
                      <RequestItem
                        key={sol.id}
                        sol={sol}
                        onApprove={handleProcessRequest}
                        onReject={handleProcessRequest}
                        processingId={processingId}
                      />
                    ))
                  ) : (
                    <p className="nenhumaSolicitacaoMensagem">
                      Nenhuma solicitação pendente no momento. Bom trabalho!
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="ultimosFilmesContainer">
              <div className="ultimosFilmesWrapper">
                <h2 className="ultimosFilmesTitulo">
                  <Film size={20} className="ultimosFilmesIcone" />
                  Últimos Filmes Adicionados
                </h2>

                <ul className="ultimosFilmesLista">
                  <RecentMovieItem
                    title="Blade Runner 2049"
                    time="Adicionado hoje"
                  />

                  <RecentMovieItem
                    title="Duna: Parte 2"
                    time="Adicionado 1 dia atrás"
                  />
                </ul>

                <button
                className="botaoVerCatalogo"
                onClick={() => window.location.href = '/catalogo'}
                >
                Ver Catálogo Completo
                </button>
              </div>
            </div>
          </section>
        </main>

        <div className="footerDashboardWrapper">
          <Footer />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className={`cartaoEstatistica ${color}`}>
    <div className="cartaoEstatisticaTopo">
      <span className="cartaoEstatisticaValor">{value}</span>
      <Icon size={32}/>
    </div>
    <p className="cartaoEstatisticaDescricao">{label}</p>
  </div>
);

const RecentMovieItem = ({ title, time }) => (
  <li className="ultimosFilmesItem">
    <span className="ultimosFilmesItemTitulo">{title}</span>
    <span className="ultimosFilmesItemTempo">{time}</span>
  </li>
);

const RequestItem = ({ sol, onApprove, onReject, processingId }) => {
  const isEdit = sol.tipo_acao === "EDICAO";
  const isAdd = sol.tipo_acao === "ADICAO";

  const acaoTexto = isEdit
    ? "Edição"
    : isAdd
    ? "Adição"
    : sol.tipo_acao.toLowerCase();

  const tagColor = isEdit
    ? "tagTipoEdicao"
    : isAdd
    ? "tagTipoAdicao"
    : "tagTipoOutro";

  const isDisabled = processingId === sol.id;

  return (
    <div
      className={`itemSolicitacao ${
        isDisabled ? "itemSolicitacaoDesabilitado" : ""
      }`}
    >
      <div className="avatarSolicitante">
        {sol.usuario_nome ? sol.usuario_nome.charAt(0) : "?"}
      </div>

      <div className="dadosSolicitacao">
        <p className="dadosSolicitacaoNome">{sol.usuario_nome}</p>

        <p className="dadosSolicitacaoDetalhes">
          Deseja fazer <span className="dadosSolicitacaoAcao">{acaoTexto}</span> do
          filme "{sol.filme_titulo || "(Novo Filme)"}"
        </p>

        <p className="dadosSolicitacaoData">
          Solicitado em: {new Date(sol.data_solicitacao).toLocaleDateString()}
        </p>
      </div>

      <span className={`tagTipoAcao ${tagColor}`}>{sol.tipo_acao}</span>

      <div className="botoesAcoes">
        <button
          className="botaoAprovar"
          onClick={() => onApprove(sol.id, "APROVAR")}
          title="Aceitar"
          disabled={isDisabled}
        >
          {isDisabled ? (
            <Loader size={16} className="iconeCarregando" />
          ) : (
            <Check size={16} />
          )}
        </button>

        <button
          className="botaoRejeitar"
          onClick={() => onReject(sol.id, "REJEITAR")}
          title="Rejeitar"
          disabled={isDisabled}
        >
          {isDisabled ? (
            <Loader size={16} className="iconeCarregando" />
          ) : (
            <X size={16} />
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
