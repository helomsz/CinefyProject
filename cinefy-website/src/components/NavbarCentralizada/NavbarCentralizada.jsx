// src/components/NavbarCentralizada/NavbarCentralizada.jsx

import React, { useState, useEffect } from "react";
import "./NavbarCentralizada.css";
import IconeLupa from "../../assets/icones/iconeLupa.svg";
import UserProfileWidget from "../User/UserProfileWidget";
import BotaoLogin from "../BotaoLogin/BotaoLogin";
import { useUserSession } from "../useUserSession";
import MovieSearch from "../MovieSearch/MovieSearch";

// 1. IMPORTAR O ÍCONE DO DASHBOARD
import { LayoutDashboard } from 'lucide-react'; 
// (Se você não tiver 'lucide-react', instale com: npm install lucide-react)

const linksNav = [
  { nome: "Home", link: "/" },
  { nome: "Catálogo", link: "/catalogo" },
  { nome: "Contato", link: "/contato" },
];

function NavbarCentralizada() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // O hook já nos dá tudo o que precisamos:
  const { user, isLoggedIn, isLoading, logoutUser } = useUserSession();

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  if (isLoading) {
    // Mantém um estado de carregamento simples
    return <header className="navbarContainer" style={{ height: '80px' }}></header>;
  }

  return (
    <header className="navbarContainer">
      {isLoggedIn ? (
        <div className="profile-spacer" aria-hidden="true"></div>
      ) : (
        <div className="profile-spacer-empty" aria-hidden="true"></div>
      )}
      <nav className={`navbarCentral`}>
        {/* Links de Navegação */}
        <ul className="listaLinksNav">
          {linksNav.map((item) => (
            <li key={item.nome}>
              <a
                href={item.link}
                className={`linkNav ${
                  currentPath === item.link ? "ativo" : ""
                }`}
              >
                {item.nome}
              </a>
            </li>
          ))}
        </ul>

        {/* ÁREA DE PESQUISA */}
        <MovieSearch />
      </nav>

      {/* 3. WIDGET DE PERFIL OU BOTÃO DE LOGIN */}
      {isLoggedIn ? (
        // 2. USAR UM FRAGMENT PARA AGRUPAR OS BOTÕES
        <React.Fragment> 
          
          {/* 3. ADICIONAR O BOTÃO DE ADMIN CONDICIONAL */}
          {/* Ele só aparece se 'user' existir E 'user.role' for 'admin' */}
          {user?.role === 'admin' && (
            <a 
              href="/admin" 
              className="navbar-admin-button" 
              title="Painel de Administração"
            >
              <LayoutDashboard size={22} />
            </a>
          )}
          
          {/* Seu UserProfileWidget original */}
          <UserProfileWidget
            isLoggedIn={isLoggedIn}
            user={user}
            onLogout={logoutUser}
          />
        </React.Fragment>
      ) : (
        // Botão de Login original
        <a href="/login" className="botao-login-nav">
          <BotaoLogin texto="Login" />
        </a>
      )}
    </header>
  );
}

export default NavbarCentralizada;