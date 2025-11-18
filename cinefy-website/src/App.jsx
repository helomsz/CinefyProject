// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistroPage from './pages/Registro/RegistroPage';
import Login from './pages/Login/Login';
import HomePage from './pages/Home/Home';
import Contato from './pages/Contato/Contato';
import Catalogo from './pages/Catalogo/Catalogo';
import CineKids from './pages/CineKids/CineKids';
import Favorites from './pages/Favoritos/Favorites';
import AdicionarFilme from './pages/AdicionarFilme/AdicionarFilme';
import PageTransitionLoader from './components/PageTransitionLoader/PageTransitionLoader';
import PaymentScreen from './pages/PaymentScreen/PaymentScreen';
import DetalhesFilme from './pages/DetalhesFilme/DetalhesFilme';
import EditarFilme from './pages/EditarFilme/EditarFilme';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import './App.css';

function App() {

  return (
    <Router>
      <main>
        <PageTransitionLoader>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<RegistroPage />} />
            <Route 
              path="/" 
              element={<HomePage />} 
            />
            <Route path="/contato" element={<Contato />} />
            <Route path="/catalogo" element={<Catalogo favoritos/>} />
            <Route path="/cinefyKids" element={<CineKids/>} />
            <Route 
              path="/favoritos" 
              element={<Favorites/>} 
            />
            <Route path="/adicionar" element={<AdicionarFilme />} />
            <Route path="/pagamento" element={<PaymentScreen />} />
            <Route path="/detalhes/:id" element={<DetalhesFilme />} />
            <Route path="/editar/:id" element={<EditarFilme/>} />
            <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          </Routes>
          
          
        </PageTransitionLoader>
      </main>
    </Router>
  );
}

export default App;
