import React, { useEffect, useState, useCallback, } from 'react';
// [NOVO] Importar o 'Loader' para o feedback de processamento
import { Check, X, Film, LayoutList, Users, Clock, Home, LogOut, Settings, Loader } from 'lucide-react';

// --- UTILS E HOOKS REFEITOS PARA ARQUIVO ÚNICO ---
const API_BASE_URL = 'http://localhost:8000'; 

// 1. Mock de Navegação (Correto)
const useNavigate = () => {
    return useCallback((path) => { 
        console.warn(`[NAVEGAÇÃO MOCK] Redirecionando para: ${path}`); 
    }, []); 
};

// 2. Hook de Autenticação (Correto)
// (O hook 'useAuth' que você colou está correto e não precisa de mudanças)
const useAuth = () => {
    const [userRole, setUserRole] = useState(undefined); 
    const [token, setToken] = useState(undefined);
    const navigate = useNavigate();

    const login = useCallback((role = 'admin', tokenValue = 'mock-jwt-token-admin') => {
        localStorage.setItem('role', role); 
        localStorage.setItem('token', tokenValue);
        setUserRole(role);
        setToken(tokenValue);
        navigate('/'); 
    }, [navigate, setUserRole, setToken]);

    const logout = useCallback(() => {
        localStorage.removeItem('role');
        localStorage.removeItem('token');
        setUserRole(null); 
        setToken(null);
        navigate('/login');
    }, [navigate, setUserRole, setToken]);

    useEffect(() => {
        let role = localStorage.getItem('role'); 
        let jwtToken = localStorage.getItem('token'); 
        
        // (Sua lógica de limpeza de 'undefined' permanece aqui)
        if (role === 'undefined') { /* ... */ role = null; }
        if (jwtToken === 'undefined') { /* ... */ jwtToken = null; }
        
        setUserRole(role); 
        setToken(jwtToken);
    }, []); 

    return { 
        userRole, 
        isAdmin: userRole === 'admin', 
        token,
        login, 
        logout 
    };
};


// 3. Componentes de Layout Simplificados (Corretos)
// (Omitidos para focar nas mudanças, mas eles permanecem iguais)
const NavbarCentralizada = () => (
    <nav className="fixed top-0 left-0 lg:left-64 w-full lg:w-[calc(100%-16rem)] h-16 bg-white shadow-md flex items-center justify-center z-10">
        <div className="text-xl font-bold text-red-600">Cinefy Admin</div>
    </nav>
);
const MenuLateral = ({ handleLogout }) => (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-6 hidden lg:flex flex-col justify-between z-20">
        <div>
            <h1 className="text-3xl font-extrabold text-red-600 mb-8">Cinefy</h1>
            <ul className="space-y-3">
                <MenuItem icon={Home} label="Dashboard" active />
                <MenuItem icon={Film} label="Adicionar Filme" />
                <MenuItem icon={LayoutList} label="Gerenciar Filmes" />
                <MenuItem icon={Users} label="Gerenciar Usuários" />
            </ul>
        </div>
        <div>
            <button 
                onClick={handleLogout} 
                className="flex items-center w-full p-2 rounded-lg hover:bg-gray-700 transition"
            >
                <LogOut size={16} className="mr-3" /> Sair
            </button>
        </div>
    </aside>
);
const MenuItem = ({ icon: Icon, label, active }) => (
    <li className={`p-2 rounded-lg transition duration-200 cursor-pointer flex items-center ${active ? 'bg-red-700 font-bold' : 'hover:bg-gray-700'}`}>
        <Icon size={18} className="mr-3" /> {label}
    </li>
);
const Footer = () => (
    <footer className="w-full text-center py-4 bg-gray-200 text-gray-600 text-sm mt-8 lg:ml-64">
        © 2024 Cinefy Admin. Todos os direitos reservados.
    </footer>
);

// --- COMPONENTE PRINCIPAL ---

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { userRole, isAdmin, token, login, logout } = useAuth(); 
    
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState(null);

    // [NOVO] Estado para feedback de carregamento nos botões
    const [processingId, setProcessingId] = useState(null);

    // [ALTERADO] Lógica de busca de dados (agora é real)
    const fetchSolicitacoes = useCallback(async () => {
        if (!token) {
            setIsLoadingData(false);
            return; 
        }

        setIsLoadingData(true);
        setError(null);
        
        try {
            // Chama o endpoint real do backend
            const response = await fetch(`${API_BASE_URL}/admin/solicitacoes`, {
                headers: {
                    // Envia o token de admin para autorização
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.mensagem || `Erro ${response.status} ao buscar dados.`);
            }
            
            const data = await response.json();
            setSolicitacoes(data); // Salva os dados reais

        } catch (err) {
            console.error("Erro na busca de solicitações:", err);
            setError(err.message);
        } finally {
            setIsLoadingData(false);
        }
    }, [token]); // Depende do token


    // [NOVO] Lógica para APROVAR ou REJEITAR
    const handleProcessRequest = useCallback(async (solicitacaoId, acao) => {
        if (!token || processingId) return; // Impede cliques duplos

        setProcessingId(solicitacaoId); // Ativa o loading para este item
        setError(null);

        const endpoint = acao === 'APROVAR' 
            ? `/admin/solicitacao/aprovar/${solicitacaoId}`
            : `/admin/solicitacao/rejeitar/${solicitacaoId}`;

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` // Autorização
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.mensagem || 'Falha ao processar solicitação.');
            }

            // Sucesso!
            alert(data.mensagem); // Exibe "Solicitação aprovada" ou "rejeitada"

            // Remove o item da lista na interface
            setSolicitacoes(prev => prev.filter(s => s.id !== solicitacaoId));

        } catch (err) {
            console.error(`Erro ao ${acao} solicitação:`, err);
            setError(err.message); // Exibe o erro no painel
        } finally {
            setProcessingId(null); // Libera os botões
        }
    }, [token, processingId]); // Depende do token e do estado de processamento


    // LÓGICA DE CARREGAMENTO E RESTRIÇÃO DE ACESSO
    // (Esta lógica está correta e permanece a mesma)
    useEffect(() => {
        if (userRole === undefined) {
            return;
        }
        if (!isAdmin || !token) { 
            console.error(`[DASHBOARD_AUTH] Acesso negado. Role: ${userRole}, Token: ${!!token}`);
            logout();
            return;
        }
        if (isAdmin && token) {
            console.log(`[DASHBOARD_AUTH] Sucesso! Role: ${userRole}. Iniciando busca de dados...`);
            fetchSolicitacoes(); 
        } 
    }, [userRole, isAdmin, token, navigate, fetchSolicitacoes, logout]); 


    // --- Renderização Condicional ---
    // (Esta lógica está correta e permanece a mesma)

    if (userRole === undefined) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 flex-col">
                <div className="text-xl font-semibold text-gray-700 mb-4">Verificando permissões...</div>
                <button
                    onClick={() => login('admin', 'mock-jwt-token-admin')}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition transform hover:scale-105"
                >
                    Logar como Admin (Teste)
                </button>
            </div>
        );
    }
    
    if (!isAdmin) {
        return null; 
    }

    if (isLoadingData) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl font-semibold text-red-600">Carregando solicitações...</div>
            </div>
        );
    }

    // (Renderização do Dashboard Principal)
    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <MenuLateral handleLogout={logout} />
            <NavbarCentralizada /> 

            <main className="pt-20 pb-10 px-4 lg:pl-68 lg:pr-10">
                
                <header className="mb-8">
                    <p className="text-sm text-gray-500">Bem vinda de volta, Mariany</p>
                    <h1 className="text-4xl font-extrabold text-gray-900">Dashboard de Administração</h1>
                </header>

                {/* [NOVO] Exibidor de Erro Global */}
                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
                        <strong>Erro:</strong> {error}
                    </div>
                )}
                
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* StatCards (Corretos) */}
                    <StatCard icon={Film} value="1,200" label="Filmes no Catálogo" color="bg-red-500" />
                    <StatCard icon={Users} value="250" label="Usuários Premium" color="bg-blue-500" />
                    <StatCard icon={Clock} value={solicitacoes.length} label="Solicitações Pendentes" color="bg-yellow-500" />

                    {/* [ALTERADO] Lista de Solicitações (agora é real) */}
                    <div className="xl:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                            <h2 className="flex items-center text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
                                <Clock size={20} className="mr-3 text-red-600" /> Gerenciador de Solicitações ({solicitacoes.length})
                            </h2>
                            <div className="space-y-4">
                                {solicitacoes.length > 0 ? (
                                    solicitacoes.map(sol => (
                                        // Passa os dados e as funções reais para o item
                                        <RequestItem 
                                            key={sol.id} 
                                            sol={sol} 
                                            onApprove={handleProcessRequest}
                                            onReject={handleProcessRequest}
                                            processingId={processingId}
                                        />
                                    ))
                                ) : (
                                    <p className="text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                                        Nenhuma solicitação pendente no momento. Bom trabalho!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Card de 'Últimos Filmes' (Correto) */}
                    <div className="xl:col-span-1 space-y-8">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                            <h2 className="flex items-center text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
                                <Film size={20} className="mr-3 text-red-600" /> Últimos Filmes Adicionados
                            </h2>
                            <ul className="space-y-3 text-sm">
                                <RecentMovieItem title="Blade Runner 2049" time="Adicionado hoje" />
                                <RecentMovieItem title="Duna: Parte 2" time="Adicionado 1 dia atrás" />
                            </ul>
                            <button className="mt-4 w-full py-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition">
                                Ver Catálogo Completo
                            </button>
                        </div>
                    </div>

                </section>
            </main>

            <Footer />
        </div>
    );
};

// --- Sub-Componentes UI (Inalterados) ---
const StatCard = ({ icon: Icon, value, label, color }) => (
    <div className={`p-6 rounded-2xl shadow-md text-white ${color} flex flex-col justify-between transform hover:scale-[1.02] transition duration-300`}>
        <div className="flex items-center justify-between">
            <span className="text-4xl font-bold">{value}</span>
            <Icon size={32} />
        </div>
        <p className="mt-2 text-sm opacity-90">{label}</p>
    </div>
);
const RecentMovieItem = ({ title, time }) => (
    <li className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-150 border border-gray-200">
        <span className="font-medium text-gray-800 truncate">{title}</span>
        <span className="text-xs text-gray-500 ml-4">{time}</span>
    </li>
);

// --- [ALTERADO] Componente RequestItem (agora é funcional) ---
const RequestItem = ({ sol, onApprove, onReject, processingId }) => {

    // Lê os dados reais do backend (das nossas JOINS no SQL)
    const isEdit = sol.tipo_acao === 'EDICAO';
    const isAdd = sol.tipo_acao === 'ADICAO';
    
    // Converte 'ADICAO' para 'Adição'
    const acaoTexto = isEdit ? "Edição" : (isAdd ? "Adição" : sol.tipo_acao.toLowerCase());
    
    // Define a cor da tag
    const tagColor = isEdit ? 'bg-blue-500' : (isAdd ? 'bg-green-500' : 'bg-red-700');
    
    // Verifica se *este* item está sendo processado
    const isDisabled = processingId === sol.id;

    return (
        // Adiciona classe 'opacity-50' se estiver desabilitado
        <div className={`flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm transition hover:shadow-md ${isDisabled ? 'opacity-50' : ''}`}>
            
            {/* Avatar com a inicial do usuário */}
            <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-4">
                {sol.usuario_nome ? sol.usuario_nome.charAt(0) : '?'}
            </div>
            
            {/* Detalhes da Solicitação */}
            <div className="flex-grow min-w-0">
                <p className="font-semibold text-gray-800 truncate">{sol.usuario_nome}</p>
                <p className="text-sm text-gray-600 truncate">
                    Deseja <span className="font-bold">{acaoTexto}</span> o filme "{sol.filme_titulo || "(Novo Filme)"}"
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    Solicitado em: {new Date(sol.data_solicitacao).toLocaleDateString()}
                </p>
            </div>
            
            {/* Tag da Ação */}
            <span className={`flex-shrink-0 ml-4 px-3 py-1 text-xs font-bold text-white rounded-full ${tagColor}`}>
                {sol.tipo_acao}
            </span>
            
            {/* Botões de Ação Reais */}
            <div className="flex-shrink-0 flex space-x-2 ml-4">
                <button 
                    className="p-2 w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 transition duration-150 disabled:bg-gray-400" 
                    onClick={() => onApprove(sol.id, 'APROVAR')}
                    title="Aceitar"
                    disabled={isDisabled}
                >
                    {/* Mostra loader ou ícone */}
                    {isDisabled ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
                </button>
                <button 
                    className="p-2 w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-150 disabled:bg-gray-400" 
                    onClick={() => onReject(sol.id, 'REJEITAR')}
                    title="Rejeitar"
                    disabled={isDisabled}
                >
                    {/* Mostra loader ou ícone */}
                    {isDisabled ? <Loader size={16} className="animate-spin" /> : <X size={16} />}
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;