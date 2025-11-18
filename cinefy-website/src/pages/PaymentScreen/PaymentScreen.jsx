import React, { useState } from 'react';
import { CreditCard, Lock, ArrowLeft } from 'lucide-react';

// Importa estilos e componentes que assumimos que existem no seu projeto
import './PaymentScreen.css'; 
import NavbarCentralizada from '../../components/NavbarCentralizada/NavbarCentralizada.jsx'; 
import MenuLateral from '../../components/MenuLateral/MenuLateral.jsx';
import Footer from '../../components/Footer/Footer.jsx'; 


// Dados do Plano Fixo (Simulação: Premium já selecionado)
const PLANO_PADRAO = { 
    nome: 'Premium', 
    precoMensal: 'R$ 49,90' 
};


const PaymentForm = ({ planoAtual = PLANO_PADRAO, onBack = () => console.log('Voltar'), onPaymentSuccess = () => {} }) => {
    
    // Estado para armazenar os dados do formulário de pagamento
    const [dadosCartao, setDadosCartao] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        cpfCnpj: '',
    });

    // Handler para capturar a mudança de valor dos campos do cartão
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setDadosCartao(prev => ({ ...prev, [id]: value }));
    };

    const handleFinalizePayment = (e) => {
        e.preventDefault();
        
        console.log("--- Dados da Transação ---");
        console.log(`Plano: ${planoAtual.nome} - ${planoAtual.precoMensal}/mês`);
        console.log("Dados do Cartão (Simulação de Envio):", dadosCartao);
        
        alert(`Pagamento do plano ${planoAtual.nome} no valor de ${planoAtual.precoMensal}/mês simulado com sucesso!`);
        onPaymentSuccess();
    };

    // Renderização do Formulário de Pagamento (A sua solicitação)
    const renderPaymentForm = () => (
        <div className="payment__content-wrapper">
            <button className="payment__back-button" onClick={onBack}>
                <ArrowLeft size={20} /> Voltar
            </button>

            <h1 className="payment__title">Finalizar Assinatura: {planoAtual.nome}</h1>
            <p className="payment__subtitle">
                Total Mensal: <span className="highlight-price">{planoAtual.precoMensal}</span>
            </p>
            
            <div className="payment__form-container">
                <div className="payment__security-message">
                    <Lock size={18} /> Seu pagamento é processado de forma segura.
                </div>
                
                <form onSubmit={handleFinalizePayment}>
                    <div className="form-group">
                        <label htmlFor="cardNumber">Número do Cartão</label>
                        <div className="input-group">
                            <CreditCard size={20} className="input-icon" />
                            <input 
                                type="text" 
                                id="cardNumber" 
                                placeholder="0000 0000 0000 0000" 
                                required 
                                maxLength="19" 
                                value={dadosCartao.cardNumber}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="cardName">Nome no Cartão</label>
                        <input 
                            type="text" 
                            id="cardName" 
                            placeholder="Seu Nome Completo" 
                            required 
                            value={dadosCartao.cardName}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="expiryDate">Vencimento</label>
                            <input 
                                type="text" 
                                id="expiryDate" 
                                placeholder="MM/AA" 
                                required 
                                maxLength="5" 
                                value={dadosCartao.expiryDate}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
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
                    
                    <div className="form-group">
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

                    <button type="submit" className="payment__submit-button">
                        Assinar {planoAtual.nome} Agora
                    </button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="payment-page-container">
            <MenuLateral />
            
            <div className="main-content-wrapper">
                <NavbarCentralizada />
                
                <main className="payment-main">
                    {renderPaymentForm()}
                </main>
                
                <Footer />
            </div>
        </div>
    );
};

export default PaymentForm;
