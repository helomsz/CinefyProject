import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './RegistroPage.css';
import BotaoPrimario from '../../components/BotaoPrimario/BotaoPrimario.jsx';
import ImagemCadastro from '../../assets/backgroundLogin/imagemLoginCadastro.png';
import { EyeIcon, EyeOffIcon, Check, AlertCircle, X } from 'lucide-react';


const URL_API_REGISTRO = 'http://localhost:8000/registro';

function RegistroPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [dadosRegistro, setDadosRegistro] = useState({
        nome: '',
        sobrenome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
    });
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
    const [mensagemStatus, setMensagemStatus] = useState({ tipo: '', texto: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [mostrarPopupSucesso, setMostrarPopupSucesso] = useState(false);

    useEffect(() => {
        const emailFromUrl = searchParams.get('email');

        if (emailFromUrl) {
            setDadosRegistro(prevDados => ({
                ...prevDados,
                email: emailFromUrl
            }));
            setMensagemStatus({ tipo: '', texto: '' });
        }
    }, [searchParams]);


    const handleChange = (event) => {
        const { name, value } = event.target;
        setDadosRegistro(prevDados => ({ ...prevDados, [name]: value }));
        setMensagemStatus({ tipo: '', texto: '' });
    };

    const fazerRegistro = async () => {
        setIsLoading(true);

        if (dadosRegistro.senha !== dadosRegistro.confirmarSenha) {
            setMensagemStatus({ tipo: 'erro', texto: 'As senhas não coincidem. Por favor, verifique.' });
            setIsLoading(false);
            return;
        }

        if (dadosRegistro.senha.length < 6) {
            setMensagemStatus({ tipo: 'erro', texto: 'A senha deve ter no mínimo 6 caracteres.' });
            setIsLoading(false);
            return;
        }

        const dadosParaBackend = {
            nome: dadosRegistro.nome,
            sobrenome: dadosRegistro.sobrenome,
            email: dadosRegistro.email,
            senha: dadosRegistro.senha,
        };

        try {
            const response = await fetch(URL_API_REGISTRO, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosParaBackend),
            });

            const resultado = await response.json();

            if (response.ok && resultado.status === 'sucesso') {
                setMensagemStatus({ tipo: 'sucesso', texto: 'Seu cadastro foi realizado com sucesso!' });
                setMostrarPopupSucesso(true);

                // redireciona para a página de login após 2 segundos
                setTimeout(() => {
                    navigate('/login');
                 }, 2000);

            } else {
                const mensagemErro = resultado.mensagem || 'Ocorreu um erro ao tentar cadastrar. Tente novamente.';
                setMensagemStatus({ tipo: 'erro', texto: `Falha no cadastro: ${mensagemErro}` });
            }
        } catch (error) {
            console.error('Erro de rede/servidor:', error);
            setMensagemStatus({ tipo: 'erro', texto: 'Falha na comunicação com o servidor. Verifique o console ou se o backend está ativo.' });
        } finally {
            if (mensagemStatus.tipo !== 'sucesso') {
                setIsLoading(false);
            }
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        fazerRegistro();
    };

    const fecharPopupERedirecionar = () => {
        setMostrarPopupSucesso(false);
        navigate('/login');
    };

    return (
        <div className="paginaWrapper">
            <div className="containerRegistro">
                <div
                    className="asideGradiente"
                    onClick={() => navigate('/')}
                >
                    <div className="botaoVoltar">
                        Voltar ao site →
                    </div>
                    <img
                        src={ImagemCadastro}
                        alt="Menino com balde de pipoca e claquete"
                        className="imagemCadastro"
                    />
                </div>

                <form className="formulario" onSubmit={handleSubmit}>
                    <div className="cabecalho">
                        <h2 className="tituloLogin">Criar uma conta</h2>
                        <p className="linkLogin">
                            Já possui uma conta? <a href="/login">Login</a>
                        </p>
                    </div>
                    {mensagemStatus.texto && mensagemStatus.tipo === 'erro' && (
                        <div className={`mensagem-status ${mensagemStatus.tipo}`}>
                            <AlertCircle size={20} />
                            <span>{mensagemStatus.texto}</span>
                        </div>
                    )}

                    <div className="grupoInputMetade">
                        <label htmlFor="nome" className="label">
                            <span className="title">Nome</span>
                            <input
                                id="nome"
                                className="input-field-registro"
                                type="text"
                                name="nome"
                                placeholder="Insira seu nome"
                                value={dadosRegistro.nome}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label htmlFor="sobrenome" className="label">
                            <span className="title">Sobrenome</span>
                            <input
                                id="sobrenome"
                                className="input-field"
                                type="text"
                                name="sobrenome"
                                placeholder="Insira seu sobrenome"
                                value={dadosRegistro.sobrenome}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>


                    <label htmlFor="email" className="label">
                        <span className="title">E-mail</span>
                        <input
                            id="email"
                            className="input-field"
                            type="email"
                            name="email"
                            placeholder="Insira seu e-mail"
                            value={dadosRegistro.email}
                            onChange={handleChange}
                            required
                        />
                    </label>


                    <label htmlFor="senha" className="label">
                        <span className="title">Crie uma senha</span>
                        <div className="inputComIconeCadastro">
                            <input
                                id="senha"
                                className="campoInputNovo"
                                type={mostrarSenha ? "text" : "password"}
                                name="senha"
                                placeholder="••••••"
                                value={dadosRegistro.senha}
                                onChange={handleChange}
                                required
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


                    <label htmlFor="confirmarSenha" className="label">
                        <span className="title">Confirme a senha</span>
                        <div className="inputComIconeCadastro">
                            <input
                                id="confirmarSenha"
                                className="campoInputNovo"
                                type={mostrarConfirmarSenha ? "text" : "password"}
                                name="confirmarSenha"
                                placeholder="••••••"
                                value={dadosRegistro.confirmarSenha}
                                onChange={handleChange}
                                required
                            />
                            {mostrarConfirmarSenha ? (
                                <EyeOffIcon
                                    size={20}
                                    className="iconeOlho"
                                    onClick={() => setMostrarConfirmarSenha(false)}
                                />
                            ) : (
                                <EyeIcon
                                    size={20}
                                    className="iconeOlho"
                                    onClick={() => setMostrarConfirmarSenha(true)}
                                />
                            )}
                        </div>
                    </label>

                    <BotaoPrimario
                        texto={isLoading ? "Criando conta..." : "Criar conta"}
                        tipo="submit"
                        disabled={isLoading}
                    />
                </form>
            </div>
            {mostrarPopupSucesso && (
                <div className="popup-overlay">
                    <div className="popup-conteudo">
                        <div className="popup-cabecalho">
                            <h3 className="titulo-popup">Cadastro Realizado</h3>
                            <button className="fechar-popup" onClick={fecharPopupERedirecionar}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="popup-corpo">
                            <Check size={78} className="icone-sucesso-grande" />
                            <p>{mensagemStatus.texto}</p>
                            <button className="botao-popup" onClick={fecharPopupERedirecionar}>Ir para o Login</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RegistroPage;