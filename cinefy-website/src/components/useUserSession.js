import { useState, useEffect } from 'react';

// Função auxiliar para ler o usuário persistido (nome, status, etc.)
const getStoredUser = () => {
    try {
        const storedData = localStorage.getItem('user_session');
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (e) {
        console.error("Erro ao ler user_session do localStorage", e);
    }
    return null;
};

// [NOVO] Funções para ler token e role do localStorage
const getStoredToken = () => {
    return localStorage.getItem('token');
};

const getStoredRole = () => {
    return localStorage.getItem('role');
};
/**
 * Hook que gerencia o estado e persistência da sessão do usuário.
 */
export const useUserSession = () => {
    const [user, setUser] = useState(getStoredUser());
    const [token, setToken] = useState(getStoredToken());
    const [role, setRole] = useState(getStoredRole());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Inicialização rápida: assume que se o localStorage foi lido, está pronto.
        setUser(getStoredUser());
        setToken(getStoredToken());
        setRole(getStoredRole());
        setIsLoading(false); 
    }, []);

    /**
     * Chamado pelo componente de Login após o sucesso do POST /login.
     * @param {object} userDataFromApi - Dados retornados do back-end (deve conter user_name e user_type).
     */
    const loginUser = (userDataFromApi) => {
        const fullUserObject = {
            name: userDataFromApi.user_name, 
            status: userDataFromApi.user_type === 'admin' ? 'admin' : 'comum', 
            role: userDataFromApi.user_type, 
            avatarUrl: '/assets/default_avatar.jpg', 
            notificationsCount: 5,
        };
        
        setUser(fullUserObject);
        setToken(userDataFromApi.token);
        setRole(userDataFromApi.user_type);

        // 1. Salva a sessão para a UI (como já fazia)
        localStorage.setItem('user_session', JSON.stringify(fullUserObject));
        localStorage.setItem('role', userDataFromApi.user_type);
        localStorage.setItem('token', userDataFromApi.token);
    };

    /**
     * Limpa o estado e o localStorage para deslogar.
     */
    const logoutUser = () => {
        // [ADICIONADO] Limpa os estados de token e role
        setUser(null);
        setToken(null);
        setRole(null);

        // Limpa o localStorage (seu código para isso já estava correto)
        localStorage.removeItem('user_session');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
    };
  const isLoggedIn = !!user && !!token; // Precisa de AMBOS para estar logado
  const isAdmin = isLoggedIn && role === 'admin';

    return { 
        user, 
        token,       // <-- Faltava isso
        role,        // <-- Faltava isso
        isLoggedIn,  // <-- Lógica corrigida
        isAdmin,     // <-- Faltava isso
        isLoading, 
        loginUser, 
        logoutUser  
    };
};