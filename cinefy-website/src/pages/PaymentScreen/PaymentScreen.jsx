import React, { useState } from 'react';
import { CreditCard, Lock, ArrowLeft } from 'lucide-react';
import NavbarCentralizada from '../../components/NavbarCentralizada/NavbarCentralizada.jsx';
import MenuLateral from '../../components/MenuLateral/MenuLateral.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import './PaymentScreen.css';

const SuccessMessage = ({ message, visible, onClose }) => {
    if (!visible) return null;

    return (
        <div className="success-modal-overlay" onClick={onClose}>
            <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
                <p>{message}</p>
                <button onClick={onClose} className="close-modal-button">Fechar</button>
            </div>
        </div>
    );
};

const PLANO_PADRAO = {
    nome: 'Premium',
    precoMensal: 'R$ 49,90',
};

const FormularioPagamento = ({
    planoAtual = PLANO_PADRAO,
    onVoltar = () => console.log('Voltar'),
    onPagamentoSucesso = () => {},
}) => {

    const [dadosCartao, setDadosCartao] = useState({
        numeroCartao: '',
        nomeNoCartao: '',
        dataVencimento: '',
        cvv: '',
        cpfCnpj: '',
    });

    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setDadosCartao((prev) => ({ ...prev, [id]: value }));
    };

    const handleFinalizarPagamento = (e) => {
        e.preventDefault();

        console.log("--- Dados da Transação Enviados ---");
        console.log(`Plano: ${planoAtual.nome} - ${planoAtual.precoMensal}/mês`);
        console.log("Dados do Cartão:", dadosCartao);

        setIsSuccessModalVisible(true);
        onPagamentoSucesso(); 
    };

    const renderFormularioPagamento = () => (
        <div className="formulario__wrapper">
            <button className="formulario__voltar-button" onClick={onVoltar} title="Voltar">
                <ArrowLeft size={29} />
            </button>

            <h1 className="formulario__titulo">
                Finalizar Assinatura: {planoAtual.nome}
            </h1>

            <p className="formulario__subtitulo">
                Total Mensal: <span className="destaque-preco">{planoAtual.precoMensal}</span>
            </p>

            <div className="formulario__container">
                <div className="formulario__mensagem-seguranca">
                    <Lock size={18} /> Seu pagamento é processado de forma segura e criptografada.
                </div>

                <form onSubmit={handleFinalizarPagamento}>
                    <div className="grupo-formulario-pagamento">
                        <label htmlFor="numeroCartao">Número do Cartão</label>
                        <div className="input-grupo-pagamento">
                            <CreditCard size={24} className="input-icon" />
                            <input
                                type="text"
                                id="numeroCartao"
                                placeholder="0000 0000 0000 0000"
                                required
                                maxLength="19"
                                value={dadosCartao.numeroCartao}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="grupo-formulario-pagamento">
                        <label htmlFor="nomeNoCartao">Nome no Cartão</label>
                        <input
                            type="text"
                            id="nomeNoCartao"
                            placeholder="Seu Nome Completo"
                            required
                            value={dadosCartao.nomeNoCartao}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="linha-formulario">
                        <div className="grupo-formulario-pagamento">
                            <label htmlFor="dataVencimento">Vencimento</label>
                            <input
                                type="text"
                                id="dataVencimento"
                                placeholder="MM/AA"
                                required
                                maxLength="5"
                                value={dadosCartao.dataVencimento}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="grupo-formulario-pagamento">
                            <label htmlFor="cvv">CVV</label>
                            <input
                                type="text"
                                id="cvv"
                                placeholder="123"
                                required
                                maxLength="4"
                                value={dadosCartao.cvv}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="grupo-formulario-pagamento">
                        <label htmlFor="cpfCnpj">CPF / CNPJ</label>
                        <input
                            type="text"
                            id="cpfCnpj"
                            placeholder="000.000.000-00"
                            required
                            value={dadosCartao.cpfCnpj}
                            onChange={handleInputChange}
                        />
                    </div>

                    <button type="submit" className="formulario__submit-button">
                        Assinar {planoAtual.nome} Agora
                    </button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="pagina-pagamento-container">
            <MenuLateral />

            <div className="conteudo-principal-wrapper">
                <NavbarCentralizada />

                <main className="pagina-pagamento-main">
                    {renderFormularioPagamento()}
                </main>

                <Footer />
            </div>

            <SuccessMessage
                visible={isSuccessModalVisible}
                onClose={() => setIsSuccessModalVisible(false)}
                message={`Pagamento do plano ${planoAtual.nome} no valor de ${planoAtual.precoMensal}/mês realizado com sucesso!`}
            />
        </div>
    );
};

export default FormularioPagamento;
