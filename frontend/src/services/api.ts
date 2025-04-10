import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Importante: permite que os cookies sejam enviados
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
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
      // Sessão expirada ou inválida
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const login = async (phone: string, password: string) => {
  try {
    const formData = new FormData();
    formData.append('phone', phone);
    formData.append('password', password);
    
    console.log('Enviando requisição de login...');
    const response = await api.post('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log('Resposta do servidor:', response.data);
    
    // Armazenar informações do usuário no localStorage
    if (response.data && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Erro na requisição de login:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/logout');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
};

export const getMessages = async () => {
  const response = await api.get('/api/messages');
  return response.data;
};

export const createMessage = async (message: any) => {
  const response = await api.post('/api/messages', message);
  return response.data;
};

export default api; 