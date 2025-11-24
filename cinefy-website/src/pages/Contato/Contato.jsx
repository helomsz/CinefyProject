import React, { useState } from 'react';
import './Contato.css'; 
import { Mail, Phone, MapPin, ArrowRight, Loader2, HelpCircle, CheckCircle, X} from 'lucide-react';
import NavbarCentralizada from '../../components/NavbarCentralizada/NavbarCentralizada';
import MenuLateral from '../../components/MenuLateral/MenuLateral';
import Footer from '../../components/Footer/Footer';
import ImagemdeFundo from '../../assets/contato/contatoFundo.svg';
import LoadingPage from '../../components/LoadingPage/LoadingPage';


const contactInfo = [
  {
    icon: Mail,
    title: 'Envie um e-mail',
    value: 'contato@cinefy.com',
    link: 'mailto:contato@cinefy.com',
  },
  {
    icon: Phone,
    title: 'Faça uma ligação',
    value: '(19) 99329-4100',
    link: 'tel:+5519993294100',
  },
  {
    icon: MapPin,
    title: 'Nossa localização',
    value: 'Senai - Campinas, São Paulo',
    link: '#', 
  },
];

const Contato = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');

    setTimeout(() => {
      if (formData.name && formData.email && formData.message) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' }); 
      } else {
        setStatus('error');
      }
    }, 2000);
  };

  const getStatusMessage = () => {
    if (status === 'success') {
      return (
        <div className="status-message success">
                <div className="status-icon-wrapper">
                    <CheckCircle size={24} className="status-icon" />
                </div>
                <div className="status-details">
                    <p className="status-title">Mensagem enviada com sucesso</p>
                    <p className="status-text">Agradecemos o seu contato com a equipe Cinefy.</p>
                </div>
            </div>
      );
    }
    if (status === 'error') {
      return (
        <div className="status-message error">
          <p className="status-text">Erro ao enviar. Por favor, preencha todos os campos.</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
    {status === 'loading' && <LoadingPage />}
    <div className="contact-page-container">
   
      <MenuLateral />
      <div className="content-spacer"></div> 
      <NavbarCentralizada />
      
     
      <img 
        src={ImagemdeFundo} 
        alt="Imagem de fundo com gradientes verde agua" 
        className="fullPageImage" 
      />
      
      <div className='contact-content'>
        <header className="contact-header">
          <span className="contact-subtitle">Contate-nos</span>
          <h1 className="contact-title">
            Queremos ouvir sua voz, fale com a equipe.
          </h1>
        </header>

        <main className="contact-main">

          {/* Coluna 1: Informações de Contato */}
          <section className="contact-info-section">
            <div className="info-header-content"> 
                <span className="info-contact-tag">
                    <div className="info-contact-icon-wrapper">
                        <HelpCircle size={18} className="info-contact-icon-tag" /> 
                    </div>
                    Contato
                </span>
                <h2 className="info-section-title">Entre em contato</h2>
                <p className="info-section-text">
                  Dúvidas? Envie sua mensagem e conecte-se com a Cinefy.
                </p>
            </div>

            <div className="contact-list">
                {contactInfo.map((item, index) => (
                    <a 
                        key={index}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-item"
                    >
                        <div className="contact-icon-wrapper">
                            <item.icon className="contact-icon" size={28} />
                        </div>
                        <div className="contact-details">
                            <p className="contact-item-title">{item.title}</p>
                            <p className="contact-item-value">{item.value}</p>
                        </div>
                        <div className="contact-arrow-wrapper">
                            <ArrowRight className="contact-item-arrow" size={24} />
                        </div>
                    </a>
                ))}
            </div>
          </section>

          {/* Coluna 2: Formulário de Contato */}
          <section className="contact-form-section">
            <form onSubmit={handleSubmit} className="contact-form">
              
              <div className="form-group-contato">
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Nome"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input-contato"
                />
              </div>

              <div className="form-group-contato">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input-contato"
                />
              </div>

              <div className="form-group-contato">
                <textarea
                  id="message"
                  name="message"
                  placeholder="Digite sua mensagem"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="7"
                  className="form-input-contato textarea"
                ></textarea>
              </div>

              {/* Mensagens de Status */}
              {getStatusMessage()}

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="submit-button"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="loading-icon" size={20} /> 
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar Mensagem
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          </section>
        </main>
        
        {/* Elementos para o efeito de fundo (bolhas de cor) */}
        <div className="bg-blur-effect top-left"></div>
        <div className="bg-blur-effect bottom-right"></div>
      </div>
      
      <div className="footer-wrapper">
        <Footer/>
      </div>
    </div>
    </>
  );
};

export default Contato;