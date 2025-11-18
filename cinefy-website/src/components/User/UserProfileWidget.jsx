import React, { useState, useCallback } from 'react'; // Importado useCallback
import { Bell, ChevronDown } from 'lucide-react';
import UserProfileDropdown from './UserProfileDropdown'; 
// NOVO: Importar o NotificationDropdown
import NotificationDropdown from './NotificationDropdown'; 
import './UserProfileWidget.css'; 
import Avatar from '../../assets/user/userAvatar.png' 

// DADOS INICIAIS DE NOTIFICAÇÕES SIMULADAS
const initialNotifications = [
    { id: 1, message: "Novo filme adicionado ao seu catálogo!", read: false, time: "2h atrás" },
    { id: 2, message: "Lançamento: Novo episódio de 'Star Wars' disponível!", read: false, time: "4h atrás" },
    { id: 3, message: "Renove sua assinatura Premium para continuar assistindo.", read: false, time: "5 dias atrás" },
];

/**
 * @param {boolean} isLoggedIn - Indica se o usuário está logado.
 * @param {object} user - Dados do usuário (nome, status, notificações).
 * @param {function} onLogout - Função para deslogar do hook de sessão.
 */
const UserProfileWidget = ({ isLoggedIn, user, onLogout }) => {
    
    // ESTADOS EXISTENTES
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // NOVO ESTADO: Lista de Notificações e Visibilidade
    const [notifications, setNotifications] = useState(initialNotifications);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // CALCULA DINAMICAMENTE A CONTAGEM DE NÃO LIDAS
    const notificationsCount = notifications.filter(n => !n.read).length;

    // --- HANDLERS DE NOTIFICAÇÃO ---

    // Marca uma única notificação como lida
    const markNotificationAsRead = useCallback((id) => {
        setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        // Opcional: Fechar o painel após clicar em uma notificação
        // setIsNotificationsOpen(false);
    }, []);

    // Marca todas as notificações como lidas
    const markAllAsRead = useCallback(() => {
        setNotifications(prev => 
            prev.map(n => ({ ...n, read: true }))
        );
    }, []);

    // Alterna a visibilidade do dropdown de Notificações
    const toggleNotifications = () => {
        // Fecha o dropdown de perfil se estiver aberto
        setIsDropdownOpen(false);
        setIsNotificationsOpen(prev => !prev);
    };

    // --- HANDLERS DE PERFIL ---

    // 2. Função para alternar o dropdown de Perfil
    const toggleDropdown = () => {
        // Fecha as notificações se estiverem abertas
        setIsNotificationsOpen(false); 
        setIsDropdownOpen(prev => !prev);
    };

    // 3. Função para fechar o widget (ambos os painéis) ao perder o foco
    const closeWidget = () => {
        // Um pequeno timeout evita que o clique abra e feche instantaneamente
        setTimeout(() => {
            setIsDropdownOpen(false);
            setIsNotificationsOpen(false);
        }, 100); 
    };
    
    // Se não estiver logado, não renderiza nada
    if (!isLoggedIn) {
        return null; 
    }

    return (
        // O container principal gerencia o foco e é o pai dos dropdowns
        <div 
            className="user-profile-widget-wrapper" 
            onBlur={closeWidget} // Usa closeWidget para fechar ambos
            tabIndex={0} 
        >
            
            {/* 1. Ícone de Notificações (Fica à esquerda) */}
            <div 
                className="notification-bell-wrapper"
                onClick={toggleNotifications} // Conecta ao novo handler
            >
                <Bell size={24} className="notification-bell-icon" />
                {notificationsCount > 0 && (
                    <span className="notification-count">{notificationsCount}</span>
                )}
            </div>

            {/* NOVO: Dropdown de Notificações Renderizado Condicionalmente */}
            {isNotificationsOpen && (
                <NotificationDropdown 
                    notifications={notifications}
                    onMarkAsRead={markNotificationAsRead}
                    onMarkAllAsRead={markAllAsRead}
                    onClose={() => setIsNotificationsOpen(false)} 
                />
            )}


            {/* 2. Cartão de Perfil (Fica à direita) */}
            <div 
                className="profile-card"
                onClick={toggleDropdown} // Ação de clique para abrir/fechar o perfil
            >
                <img 
                    src={Avatar} 
                    alt={user.name} 
                    className="profile-avatar"
                />
                <div className="profile-details">
                    <span className="profile-name">{user.name.split(' ')[0]}</span> 
                    <span className="profile-status">{user.status}</span> 
                </div>
                <ChevronDown 
                    size={20} 
                    className={`profile-dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} 
                />
            </div>
            
            {/* 3. Dropdown de Perfil Renderizado Condicionalmente */}
            {isDropdownOpen && (
                <UserProfileDropdown 
                    onLogout={onLogout} 
                    user={user} 
                    onClose={() => setIsDropdownOpen(false)} 
                />
            )}
        </div>
    );
}

export default UserProfileWidget;