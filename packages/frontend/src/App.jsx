import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importação das páginas
import Login from './pages/Login';
import Cadastro from './pages/Cadastro.jsx';
import Home from './pages/Home';
import MeusChamados from './pages/MeusChamados';

// Esta função Protege as rotas.
// Ela verifica se existe um token no navegador antes de deixar o usuário entrar.
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // Se não houver token, redireciona para o login
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas Públicas: Acessíveis sem login */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rotas Privadas: Exigem o token JWT via ProtectedRoute */}
        <Route 
          path="/meus-chamados" 
          element={
            <ProtectedRoute>
                <MeusChamados />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/fila-global" 
          element={
            <ProtectedRoute>
              <div>Tela de Fila (Analista)</div>
            </ProtectedRoute>
          } 
        />

        {/* Redirecionamento padrão: Qualquer rota desconhecida vai para o Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;