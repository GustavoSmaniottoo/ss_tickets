import axios from 'axios';

// Criamos uma "instância" personalizada do Axios
const api = axios.create({
  baseURL: 'http://localhost:3000', // Endereço do seu backend
});

// INTERCEPTOR: Antes de qualquer requisição sair, esta função é executada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Pega a "chave" guardada no login
  
  if (token) {
    // Se existir um token, ele anexa no formato Bearer exigido pelo seu authMiddleware.js
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;