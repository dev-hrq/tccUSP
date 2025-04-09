import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer fake_token' // Token fake para autenticação
  },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Adicionar o prefixo 'Bearer ' apenas quando for enviar a requisição
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = async (phone: string, password: string) => {
  // Por enquanto, apenas retornamos um token fake
  return { access_token: 'fake_token' };
};

export const getMessages = async () => {
  const response = await api.get('/messages');
  return response.data;
};

export const createMessage = async (message: {
  recipient_phone: string;
  message: string;
  event_date: string;
  reminder_days: number;
}) => {
  const response = await api.post('/messages', message);
  return response.data;
};

export default api; 