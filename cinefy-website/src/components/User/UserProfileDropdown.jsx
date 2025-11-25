import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import { User, Settings, Info, LogOut } from 'lucide-react';

import './UserProfileDropdown.css';

/**

 * @param {function} onLogout 
 * @param {object} user 
 * @param {function} onClose 
 */
function UserProfileDropdown({ onLogout, user, onClose }) {
    const navigate = useNavigate(); 
    const menuItems = [
        { icon: Info, label: 'Central de Ajuda', action: () => { 
            console.log('Navegar para a Central de Ajuda'); 
            onClose();
        }, link: '/contato' },
    ];

    const handleLogout = () => {
        onLogout(); 
        onClose();
        navigate('/login');
    };

    return (
        <div className="profileDropdownContainer" onClick={(e) => e.stopPropagation()}>
            <div className="dropdownHeader">
                <p className="dropdownUserName">Olá, {user.name.split(' ')[0]}!</p> 
                <p className="dropdownUserStatus">{user.status}</p>
            </div>
            
            <div className="dropdownDivider"></div>
            <ul className="dropdownMenuList">
                {menuItems.map((item) => (
                    <li 
                        key={item.label} 
                        className="dropdownMenuItem" 
                        onClick={item.action}
                    >
                        <item.icon size={20} className="dropdownIcon" />
                        <span className="dropdownLabel">{item.label}</span>
                    </li>
                ))}
            </ul>

            <div className="dropdownDivider"></div>

            <div 
                className="dropdownMenuItem logoutItem" 
                onClick={handleLogout}
            >
                <LogOut size={20} className="dropdownIcon logoutIcon" />
                <span className="dropdownLabel">Sair</span>
            </div>
        </div>
    );
}

export default UserProfileDropdown;
