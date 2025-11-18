import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate
import { User, Settings, Info, LogOut } from 'lucide-react'; // Ícones modernos

import './UserProfileDropdown.css'; // O CSS vem a seguir

/**
 * Menu Dropdown de Perfil. 
 * @param {function} onLogout - Função para deslogar (vem do useUserSession).
 * @param {object} user - Objeto do usuário (para mostrar dados no topo).
 * @param {function} onClose - Função para fechar o dropdown.
 */
function UserProfileDropdown({ onLogout, user, onClose }) {
    const navigate = useNavigate(); // useNavigate deve ser chamado no início do componente

    // Lista dos itens do menu conforme sua solicitação
    const menuItems = [
        { icon: User, label: 'Perfil', action: () => { 
            console.log('Navegar para a página de perfil'); 
            onClose();
        }, link: '/perfil' },
        { icon: Info, label: 'Central de Ajuda', action: () => { 
            console.log('Navegar para a Central de Ajuda'); 
            onClose();
        }, link: '/contato' },
    ];

    const handleLogout = () => {
        onLogout(); // Limpa o estado de login e session storage
        onClose();  // Fecha o dropdown
        navigate('/login'); // Redireciona para a página de login
    };

    return (
        <div className="profileDropdownContainer" onClick={(e) => e.stopPropagation()}>
            
            {/* Cabeçalho do Usuário */}
            <div className="dropdownHeader">
                {/* Nome e Status (usando os dados reais do 'user') */}
                <p className="dropdownUserName">Olá, {user.name.split(' ')[0]}!</p> 
                <p className="dropdownUserStatus">{user.status}</p>
            </div>
            
            <div className="dropdownDivider"></div>

            {/* Itens de Navegação */}
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

            {/* Botão de Sair (Log out) */}
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
