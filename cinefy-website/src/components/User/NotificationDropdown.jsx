import React from 'react';
import './NotificationDropdown.css'; 

/**
 * @param {Array<Object>} notifications - Lista de objetos de notificação.
 * @param {function} onMarkAsRead - Função para marcar um item específico como lido.
 * @param {function} onMarkAllAsRead - Função para marcar todos os itens como lidos.
 * @param {function} onClose - Função para fechar o dropdown.
 */
const NotificationDropdown = ({ notifications, onMarkAsRead, onMarkAllAsRead, onClose }) => {
    
    // Garantir que a lista de notifications não seja nula antes de filtrar
    const validNotifications = notifications || [];
    const unreadCount = validNotifications.filter(n => !n.read).length;

    // Handler para o clique em uma notificação
    const handleNotificationClick = (id) => {
        onMarkAsRead(id); // Marca o item como lido
        // Opcional: redirecionar para o conteúdo (ex: /filme/novo-lancamento)
    };

    return (
        // ADIÇÃO CHAVE: Usar e.stopPropagation() para evitar que o onBlur do wrapper feche o painel
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
                            // Aplica a classe condicionalmente
                            className={`notification-item ${!notification.read ? 'unread' : 'read'}`}
                            // Ação ao clicar: marca como lida
                            onClick={() => handleNotificationClick(notification.id)}
                        >
                            <p className="notification-message">{notification.message}</p>
                            <span className="notification-time">{notification.time}</span>
                        </li>
                    ))}
                </ul>
            )}
            
            {/* O Rodapé só aparece se houver notificações lidas ou não lidas */}
            {validNotifications.length > 0 && (
                <div className="dropdown-footer">
                    {/* Ação ao clicar: marca todos como lidos */}
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