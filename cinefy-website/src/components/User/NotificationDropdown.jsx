import React from 'react';
import './NotificationDropdown.css'; 

/**
 * @param {Array<Object>} notifications 
 * @param {function} onMarkAsRead 
 * @param {function} onMarkAllAsRead 
 * @param {function} onClose 
 */
const NotificationDropdown = ({ notifications, onMarkAsRead, onMarkAllAsRead, onClose }) => {
    const validNotifications = notifications || []; // garante que a lista de notificações não seja null ou undefined
    const unreadCount = validNotifications.filter(n => !n.read).length; // conta quantas notificações ainda não foram lidas
    
    // função que lida com o clique em uma notificação e a marca como lida
    const handleNotificationClick = (id) => {
        onMarkAsRead(id);  // chama a função onMarkAsRead passando o ID da notificação
    };

    return (
        <div 
            className="notification-dropdown" 
            onClick={(e) => e.stopPropagation()}
        >
            <div className="dropdown-header">
                <h3>Notificações</h3>
                {unreadCount > 0 && (
                    <span className="unread-badge">{unreadCount} novas</span>
                )}
            </div>

            {validNotifications.length === 0 ? (
                <p className="empty-message">Nenhuma notificação recente.</p>
            ) : ( // caso haja notificações, as exibe em uma lista
                <ul className="notification-list">
                    {validNotifications.map(notification => (
                        // mapeia as notificações e cria um item para cada uma
                        <li 
                            key={notification.id} 
                            className={`notification-item ${!notification.read ? 'unread' : 'read'}`}
                            onClick={() => handleNotificationClick(notification.id)}
                        >
                            <p className="notification-message">{notification.message}</p>
                            <span className="notification-time">{notification.time}</span>
                        </li>
                    ))}
                </ul>
            )}
            
            {validNotifications.length > 0 && ( // se houver notificações, exibe o botão para marcar todas como lidas
                <div className="dropdown-footer">
                    <button 
                        onClick={onMarkAllAsRead} 
                        className="mark-as-read-button"
                    >
                        Marcar todas como lidas
                    </button>
                </div>
            )}
        </div>
    );
}

export default NotificationDropdown;