import React from 'react';
import './NotificationDropdown.css'; 

/**
 * @param {Array<Object>} notifications 
 * @param {function} onMarkAsRead 
 * @param {function} onMarkAllAsRead 
 * @param {function} onClose 
 */
const NotificationDropdown = ({ notifications, onMarkAsRead, onMarkAllAsRead, onClose }) => {
    const validNotifications = notifications || [];
    const unreadCount = validNotifications.filter(n => !n.read).length;
    const handleNotificationClick = (id) => {
        onMarkAsRead(id);
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
            ) : (
                <ul className="notification-list">
                    {validNotifications.map(notification => (
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
            
            {validNotifications.length > 0 && (
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