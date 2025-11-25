import { useState, useEffect } from 'react';
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

//  ler token e role do localStorage
const getStoredToken = () => {
    return localStorage.getItem('token');
};

const getStoredRole = () => {
    return localStorage.getItem('role');
};

export const useUserSession = () => {
    const [user, setUser] = useState(getStoredUser());
    const [token, setToken] = useState(getStoredToken());
    const [role, setRole] = useState(getStoredRole());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        //assume que se o localStorage foi lido
        setUser(getStoredUser());
        setToken(getStoredToken());
        setRole(getStoredRole());
        setIsLoading(false); 
    }, []);

    /**
     * @param {object} userDataFromApi
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

        localStorage.setItem('user_session', JSON.stringify(fullUserObject));
        localStorage.setItem('role', userDataFromApi.user_type);
        localStorage.setItem('token', userDataFromApi.token);
    };

    /**
     * limpa o estado e o localStorage para deslogar.
     */
    const logoutUser = () => {
        //limpa os estados de token e role
        setUser(null);
        setToken(null);
        setRole(null);

        // limpa o localStorage 
        localStorage.removeItem('user_session');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
    };
  const isLoggedIn = !!user && !!token; // precisa dos dois para estar logado
  const isAdmin = isLoggedIn && role === 'admin';

    return { 
        user, 
        token,       
        role,       
        isLoggedIn,
        isAdmin,   
        isLoading, 
        loginUser, 
        logoutUser  
    };
};