import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Bem-vindo ao SS Tickets</h1>
            <p>Sua plataforma centralizada de suporte e chamados.</p>
            
            <div style={{ marginTop: '20px' }}>
                <Link to="/login">
                    <button style={{ marginRight: '10px' }}>Entrar no Sistema</button>
                </Link>
                <Link to="/cadastro">
                    <button>Criar Nova Conta</button>
                </Link>
            </div>
        </div>
    );
};

export default Home;