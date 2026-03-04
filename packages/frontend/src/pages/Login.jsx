import React, { useState } from 'react';
import api from '../api/api'; // Importa a sua instância configurada do Axios
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault(); 

        try {
            // Utilizamos o Axios (api) em vez do fetch nativo.
            // O Axios já entende que deve enviar como JSON e trata o corpo da requisição
            const response = await api.post('/usuarios/login', { email, senha });

            // No Axios, os dados retornados pelo backend ficam dentro da propriedade 'data'
            if (response.status === 200) {
                const { token } = response.data; // Pega o token gerado pelo usuarioController.js
                
                localStorage.setItem('token', token); // Armazena para uso nos interceptors
                setMensagem("Login realizado com sucesso!");

                navigate('/meus-chamados');
                
                // Opcional: Redirecionar o usuário aqui
            }
        } catch (error) {
            // O Axios joga erros (4xx, 5xx) diretamente para o catch.
            // Acessamos a mensagem de erro definida no seu controller
            const msgErro = error.response?.data?.error || "Erro de conexão com o servidor.";
            setMensagem(msgErro);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>SS Tickets - Login</h2>
      
            <form onSubmit={handleSubmit}>
                <div>
                    <label>E-mail:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        data-cy="login-email" // Mantido para seus testes Cypress
                        required 
                    />
                </div>

                <div style={{ marginTop: '10px' }}>
                    <label>Senha:</label>
                    <input 
                        type="password" 
                        value={senha} 
                        onChange={(e) => setSenha(e.target.value)} 
                        data-cy="login-password"
                        required 
                    />
                </div>

                <button type="submit" style={{ marginTop: '20px' }} data-cy="login-button">
                    Entrar
                </button>
            </form>

            {mensagem && <p data-cy="login-message">{mensagem}</p>}
        </div>
    );
};

export default Login;