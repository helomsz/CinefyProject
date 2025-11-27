import React, { useState, useEffect } from "react";
import "./NavbarCentralizada.css";
import IconeLupa from "../../assets/icones/iconeLupa.svg";
import UserProfileWidget from "../User/UserProfileWidget";
import BotaoLogin from "../BotaoLogin/BotaoLogin";
import { useUserSession } from "../useUserSession";
import MovieSearch from "../MovieSearch/MovieSearch";

import { LayoutDashboard } from 'lucide-react';

// links do menu de navegação
const linksNav = [
  { nome: "Home", link: "/" },
  { nome: "Catálogo", link: "/catalogo" },
  { nome: "Contato", link: "/contato" },
];

function NavbarCentralizada() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname); // estado para controlar o caminho atual

  // usando o hook personalizado useUserSession para gerenciar a sessão do usuário
  const { user, isLoggedIn, isLoading, logoutUser } = useUserSession();

  // atualiza o estado do caminho atual quando o usuário navega entre páginas
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // adiciona o event listener para mudanças de URL
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  // exibe um loading ou um cabeçalho vazio enquanto o estado da sessão é carregado
  if (isLoading) {
    return <header className="navbarContainer" style={{ height: '80px' }}></header>;
  }

  return (
    <header className="navbarContainer">
      {/* se o usuário está logado, reserva o espaço para o perfil, caso contrário, deixa o espaço vazio */}
      {isLoggedIn ? (
        <div className="profile-spacer" aria-hidden="true"></div>
      ) : (
        <div className="profile-spacer-empty" aria-hidden="true"></div>
      )}
      <nav className={`navbarCentral`}>
        <ul className="listaLinksNav">
          {linksNav.map((item) => (
            <li key={item.nome}>
              <a
                href={item.link}
                className={`linkNav ${currentPath === item.link ? "ativo" : ""
                  }`}
              >
                {item.nome}
              </a>
            </li>
          ))}
        </ul>
        {/* componente de busca de filmes */}
        <MovieSearch />
      </nav>


      {isLoggedIn ? (
        <React.Fragment>
          {/* se o usuário for admin, exibe o botão de administração */}
          {user?.role === 'admin' && (
            <a
              href="/admin"
              className="navbar-admin-button"
              title="Painel de Administração"
            >
              <LayoutDashboard size={22} />
            </a>
          )}
          <UserProfileWidget
            isLoggedIn={isLoggedIn}
            user={user}
            onLogout={logoutUser}
          />
        </React.Fragment>
      ) : (
        <a href="/login" className="botao-login-nav">
          {/* se o usuário não estiver logado, exibe o botão de login */}
          <BotaoLogin texto="Login" />
        </a>
      )}
    </header>
  );
}

export default NavbarCentralizada;