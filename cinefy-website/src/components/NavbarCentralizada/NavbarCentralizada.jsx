import React, { useState, useEffect } from "react";
import "./NavbarCentralizada.css";
import IconeLupa from "../../assets/icones/iconeLupa.svg";
import UserProfileWidget from "../User/UserProfileWidget";
import BotaoLogin from "../BotaoLogin/BotaoLogin";
import { useUserSession } from "../useUserSession";
import MovieSearch from "../MovieSearch/MovieSearch";

import { LayoutDashboard } from 'lucide-react'; 


const linksNav = [
  { nome: "Home", link: "/" },
  { nome: "Catálogo", link: "/catalogo" },
  { nome: "Contato", link: "/contato" },
];

function NavbarCentralizada() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const { user, isLoggedIn, isLoading, logoutUser } = useUserSession();

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  if (isLoading) {
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

        <MovieSearch />
      </nav>


      {isLoggedIn ? (
        <React.Fragment> 
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
          <BotaoLogin texto="Login" />
        </a>
      )}
    </header>
  );
}

export default NavbarCentralizada;