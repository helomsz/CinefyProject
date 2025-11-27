import React, { useState, useCallback } from 'react'; 
import { Bell, ChevronDown } from 'lucide-react';
import UserProfileDropdown from './UserProfileDropdown'; 
import NotificationDropdown from './NotificationDropdown'; 
import './UserProfileWidget.css'; 
import Avatar from '../../assets/user/userAvatar.png' 

// definindo um conjunto inicial de notificações
const initialNotifications = [
    { id: 1, message: "Novo filme adicionado ao seu catálogo!", read: false, time: "2h atrás" },
    { id: 2, message: "Lançamento: Novo episódio de 'Star Wars' disponível!", read: false, time: "4h atrás" },
    { id: 3, message: "Renove sua assinatura Premium para continuar assistindo.", read: false, time: "5 dias atrás" },
];

/**
 * @param {boolean} isLoggedIn 
 * @param {object} user 
 * @param {function} onLogout
 */
const UserProfileWidget = ({ isLoggedIn, user, onLogout }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // estado que controla a visibilidade do dropdown do perfil
    const [notifications, setNotifications] = useState(initialNotifications); // estado para armazenar as notificações
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false); // estado que controla a visibilidade do dropdown de notificações
    const notificationsCount = notifications.filter(n => !n.read).length;

    const markNotificationAsRead = useCallback((id) => {
        setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    // marca todas as notificações como lidas
    const markAllAsRead = useCallback(() => {
        setNotifications(prev => 
            prev.map(n => ({ ...n, read: true }))
        );
    }, []);

    // alterna a visibilidade do dropdown 
    const toggleNotifications = () => {
        // fecha o dropdown de perfil se estiver aberto
        setIsDropdownOpen(false);
        setIsNotificationsOpen(prev => !prev);
    };


    const toggleDropdown = () => {
        setIsNotificationsOpen(false); 
        setIsDropdownOpen(prev => !prev);
    };

    const closeWidget = () => {
        setTimeout(() => {
            setIsDropdownOpen(false);
            setIsNotificationsOpen(false);
        }, 100); 
    };
    
    // se não tiver logado, não renderiza nada
    if (!isLoggedIn) {
        return null; 
    }

    return (
        <div 
            className="user-profile-widget-wrapper" 
            onBlur={closeWidget}
            tabIndex={0} 
        >

            <div 
                className="notification-bell-wrapper"
                onClick={toggleNotifications} // conecta ao novo handler
            >
                <Bell size={24} className="notification-bell-icon" />
                {notificationsCount > 0 && (
                    <span className="notification-count">{notificationsCount}</span>
                )}
            </div>

            {isNotificationsOpen && (
                <NotificationDropdown 
                    notifications={notifications}
                    onMarkAsRead={markNotificationAsRead}
                    onMarkAllAsRead={markAllAsRead}
                    onClose={() => setIsNotificationsOpen(false)} 
                />
            )}

            <div 
                className="profile-card"
                onClick={toggleDropdown}
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