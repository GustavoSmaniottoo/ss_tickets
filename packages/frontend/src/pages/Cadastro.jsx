import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api'; // Sua instância do Axios

const Cadastro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    perfil_id: 1 // Começa como Solicitante por padrão
  });
  const [mensagem, setMensagem] = useState('');

  // Função única para atualizar qualquer campo do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    try {
      // Chamada para o backend via Axios
      const response = await api.post('/usuarios', formData);
      
      if (response.status === 201) {
        setMensagem("Usuário criado com sucesso! Prossiga para o Login.");

        setTimeout(() => {
        navigate('/login');
        }, 2000);
      }
    } catch (error) {
      // Captura o erro 409 (E-mail duplicado) ou 400 (Dados inválidos)
      const msgErro = error.response?.data?.message || error.response?.data?.error;
      setMensagem(msgErro || "Erro ao realizar cadastro.");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>SS Tickets - Novo Usuário</h2>
      <form onSubmit={handleCadastro}>
        <input 
          name="nome" 
          placeholder="Nome Completo" 
          onChange={handleChange} 
          required 
          data-cy="cad-nome"
        />
        <input 
          name="email" 
          type="email" 
          placeholder="E-mail" 
          onChange={handleChange} 
          required 
          data-cy="cad-email"
        />
        <input 
          name="senha" 
          type="password" 
          placeholder="Senha (mín. 6 caracteres)" 
          onChange={handleChange} 
          required 
          data-cy="cad-senha"
        />
        
        <select name="perfil_id" onChange={handleChange} data-cy="cad-perfil">
          <option value="1">Solicitante</option>
          <option value="2">Analista</option>
        </select>

        <button type="submit" style={{ marginTop: '20px' }}>Criar Conta</button>
      </form>
      {mensagem && <p>{mensagem}</p>}
    </div>
  );
};

export default Cadastro;