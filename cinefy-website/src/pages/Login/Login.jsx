import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import BotaoPrimario from "../../components/BotaoPrimario/BotaoPrimario.jsx";
import ImagemCadastro from "../../assets/backgroundLogin/imagemLoginCadastro.png";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useUserSession } from "../../components/useUserSession.js";

function LoginPage() {
  const navigate = useNavigate();
  const { loginUser } = useUserSession();

  const [dadosLogin, setDadosLogin] = useState({
    email: "",
    senha: "",
    lembrar: false,
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setDadosLogin((prevDados) => ({
      ...prevDados,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const loginDataParaBackend = {
      email: dadosLogin.email, 
      senha: dadosLogin.senha,
    };

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginDataParaBackend),
      });

      console.log("HTTP OK:", response.ok, "Status:", response.status);

      const result = await response.json();
      console.log("JSON Retornado:", result);

      if (response.ok && result.status === "sucesso") {
            const { token, role } = result;

            if (token) {
                localStorage.setItem('token', token);

                localStorage.setItem('role', role);
                loginUser(result); 
                
                navigate("/");
            } else {
                setErrorMessage("Resposta do servidor OK, mas token de acesso não encontrado.");
            }
      } else {
        const message =
          result.mensagem || "Credenciais inválidas. Tente novamente.";
        setErrorMessage(message);
      }
    } catch (error) {
      console.error("Erro na autenticação:", error);
      setErrorMessage("Erro de conexão com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="paginaWrapper">
      <div className="containerRegistro">
        <div className="asideGradiente" onClick={() => navigate("/")}>
          <div className="botaoVoltar">Voltar ao site →</div>
          <img
            src={ImagemCadastro}
            alt="Menino com balde de pipoca e claquete"
            className="imagemCadastro"
          />
        </div>

        <form className="formulario" onSubmit={handleSubmit}>
          <div className="cabecalho">
            <h3 className="bemVindo">Bem-vindo de volta!</h3>
            <h2 className="tituloLogin">Fazer Login</h2>
            <p className="linkLogin">
              Não possui uma conta? <a href="/cadastro">Cadastro</a>
            </p>
          </div>

          {/* E-MAIL */}
          <label htmlFor="email" className="label">
            <span className="title">E-mail</span>
            <input
              id="email"
              className="input-field"
              type="email"
              name="email"
              placeholder="Insira seu e-mail"
              value={dadosLogin.email}
              onChange={handleChange}
            />
          </label>

          {/* SENHA */}
          <label htmlFor="senha" className="label">
            <span className="title">Senha</span>
            <div className="inputComIconeLogin">
              <input
                id="senha"
                className="campoInputNovo"
                type={mostrarSenha ? "text" : "password"}
                name="senha"
                placeholder="••••••"
                value={dadosLogin.senha}
                onChange={handleChange}
              />
              {mostrarSenha ? (
                <EyeOffIcon
                  size={20}
                  className="iconeOlho"
                  onClick={() => setMostrarSenha(false)}
                />
              ) : (
                <EyeIcon
                  size={20}
                  className="iconeOlho"
                  onClick={() => setMostrarSenha(true)}
                />
              )}
            </div>
          </label>

          <div className="linhaLembreSenha">
            <label className="checkboxContainer">
              <input
                type="checkbox"
                name="lembrar"
                checked={dadosLogin.lembrar}
                onChange={handleChange}
              />
              <span>Lembre-se de mim</span>
            </label>
            <a href="#" className="linkEsqueciSenha">
              Esqueci minha senha
            </a>
          </div>

          <BotaoPrimario texto={isSubmitting ? "Entrando..." : "Entrar"} tipo="submit" disabled={isSubmitting} />

          {errorMessage && (
            <div
              className="mensagemErro"
              style={{
                color: "red",
                marginTop: "15px",
                fontWeight: "bold",
              }}
            >
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;