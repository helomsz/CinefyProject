import React, { useState } from 'react'; 
import { CreditCard, Lock, ArrowLeft } from 'lucide-react'; 
import NavbarCentralizada from '../../components/NavbarCentralizada/NavbarCentralizada.jsx'; 
import MenuLateral from '../../components/MenuLateral/MenuLateral.jsx'; 
import { useNavigate } from 'react-router-dom'; 

import './PaymentScreen.css'; 

// componente para exibir mensagem de sucesso ao realizar o pagamento
const SuccessMessage = ({ message, visible, onClose }) => {
    if (!visible) return null; // não exibe a mensagem se "visible" for false

    return (
        <div className="success-modal-overlay" onClick={onClose}>
            <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
                <p>{message}</p>
                <button onClick={onClose} className="close-modal-button">Fechar</button>
            </div>
        </div>
    );
};

// definindo o plano padrão como 'Premium'
const PLANO_PADRAO = {
    nome: 'Premium',
    precoMensal: 'R$ 49,90',
};


const FormularioPagamento = ({
    planoAtual = PLANO_PADRAO, 
    onVoltar = () => console.log('Voltar'), // função que será chamada ao clicar no botão de voltar
    onPagamentoSucesso = () => {}, // função que será chamada quando o pagamento for bem-sucedido
}) => {

    const navigate = useNavigate(); // hook de navegação
    const handleVoltar = () => navigate('/'); // função para navegar de volta à página inicial

    // estado para armazenar os dados do cartão de pagamento
    const [dadosCartao, setDadosCartao] = useState({
        numeroCartao: '',
        nomeNoCartao: '',
        dataVencimento: '',
        cvv: '',
        cpfCnpj: '',
    });

    // estado para controlar a exibição da modal de sucesso
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

    // função para atualizar os dados do cartão conforme o usuário digita
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setDadosCartao((prev) => ({ ...prev, [id]: value })); // atualiza o campo do cartão correspondente
    };

    // função chamada ao enviar o formulário de pagamento
    const handleFinalizarPagamento = (e) => {
        e.preventDefault(); // previne o comportamento padrão do formulário (não recarregar a página)

        console.log("--- Dados da Transação Enviados ---");
        console.log(`Plano: ${planoAtual.nome} - ${planoAtual.precoMensal}/mês`);
        console.log("Dados do Cartão:", dadosCartao);

        setIsSuccessModalVisible(true); // exibe a modal de sucesso
        onPagamentoSucesso(); // chama a função de sucesso passada como prop
    };

    // função que renderiza o conteúdo do formulário de pagamento
    const renderFormularioPagamento = () => (
        <div className="formulario__wrapper">
            {/* botão de voltar */}
            <button className="formulario__voltar-button" onClick={handleVoltar} title="Voltar">
                <ArrowLeft size={29} />
            </button>

            <h1 className="formulario__titulo">
                Finalizar Assinatura: {planoAtual.nome}
            </h1>

            <p className="formulario__subtitulo">
                Total Mensal: <span className="destaque-preco">{planoAtual.precoMensal}</span>
            </p>

            <div className="formulario__container">
                {/* mensagem de segurança */}
                <div className="formulario__mensagem-seguranca">
                    <Lock size={18} /> Seu pagamento é processado de forma segura e criptografada.
                </div>

                {/* formulário de pagamento */}
                <form onSubmit={handleFinalizarPagamento}>
                    {/* campo para número do cartão */}
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

                    {/* campo para nome no cartão */}
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
                        {/* campo para data de vencimento */}
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

                        {/* campo para CVV */}
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

                    {/* campo para CPF ou CNPJ */}
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

                    {/* botão de envio */}
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
                    {renderFormularioPagamento()} {/* renderiza o formulário de pagamento */}
                </main>

            </div>

            {/* modal de sucesso */}
            <SuccessMessage
                visible={isSuccessModalVisible}
                onClose={() => setIsSuccessModalVisible(false)} // fecha a modal ao clicar no botão "Fechar"
                message={`Pagamento do plano ${planoAtual.nome} no valor de ${planoAtual.precoMensal}/mês realizado com sucesso!`} // Mensagem de sucesso
            />
        </div>
    );
};

export default FormularioPagamento;
