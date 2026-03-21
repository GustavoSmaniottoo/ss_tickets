import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

// Decodifica o payload do JWT sem biblioteca externa.
// O token é composto por 3 partes separadas por ponto: header.payload.signature
// O payload é base64url — diferente do base64 padrão, usa '-' e '_' no lugar de '+' e '/'
// Por isso substituímos antes de passar pro atob()
const decodeToken = (token) => {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
        return null; // Se o token for inválido ou malformado, retorna null com segurança
    }
};

// Mapa de redirecionamento por perfil_id conforme RF01/RF02
// perfil_id 1 = Solicitante → vai para seus próprios chamados
// perfil_id 2 = Analista    → vai para a fila global de atendimento
const ROTAS_POR_PERFIL = {
    1: '/meus-chamados',
    2: '/fila-global',
};

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            // Envia as credenciais para o backend via Axios (já configurado em api/api.js)
            const response = await api.post('/usuarios/login', { email, senha });

            if (response.status === 200) {
                const { token } = response.data;

                // Armazena o token no localStorage para uso nos interceptors do Axios
                // (o interceptor em api.js injeta o token no header Authorization automaticamente)
                localStorage.setItem('token', token);

                // Decodifica o payload para ler o perfil_id sem precisar de nova chamada ao backend
                const decoded = decodeToken(token);

                // Busca a rota pelo perfil_id; se não encontrar, cai no fallback /meus-chamados
                const rota = ROTAS_POR_PERFIL[decoded?.perfil] ?? '/meus-chamados';

                // replace: true remove /login do histórico do navegador,
                // evitando que o usuário volte para a tela de login ao clicar em "voltar"
                navigate(rota, { replace: true });
            }
        } catch (error) {
            // O Axios lança erros 4xx/5xx diretamente no catch
            // Exibe a mensagem de erro retornada pelo backend ou uma mensagem genérica
            const msgErro = error.response?.data?.error || 'Erro de conexão com o servidor.';
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
                        data-cy="login-email" // Seletor para testes Cypress
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

            {/* Exibe mensagem de erro caso o login falhe */}
            {mensagem && <p data-cy="login-message">{mensagem}</p>}
        </div>
    );
};

export default Login;