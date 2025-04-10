import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ptBR from 'date-fns/locale/pt-BR';
import { createMessage, getMessages, logout } from '../services/api';
import { format } from 'date-fns';
import Header from './Header';
import Footer from './Footer';

interface Message {
  id: string;
  recipient_phone: string;
  message: string;
  event_date: string;
  reminder_days: number;
  status: string;
  created_at: string;
  sender_id: string;
}

interface User {
  id: string;
  first_name: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState({
    recipient_phone: '',
    message: '',
    event_date: '',
    reminder_days: 0
  });
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setNewMessage({ ...newMessage, recipient_phone: formattedPhone });
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/');
      return;
    }

    try {
      const parsedUser = JSON.parse(user);
      setCurrentUser({
        id: parsedUser.id,
        first_name: parsedUser.first_name
      });
      loadMessages();
    } catch (err) {
      console.error('Erro ao carregar usuário:', err);
      navigate('/');
    }
  }, [navigate]);

  const loadMessages = async () => {
    try {
      const data = await getMessages();
      setMessages(data);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
      setError('Erro ao carregar mensagens');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMessage(newMessage);
      setNewMessage({
        recipient_phone: '',
        message: '',
        event_date: '',
        reminder_days: 0
      });
      loadMessages();
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError('Erro ao enviar mensagem');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header />
      <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 2, flex: 1 }}>
        <Box
          sx={{
            marginTop: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography component="h1" variant="h5">
                Bem-vindo, {currentUser?.first_name || 'Usuário'}!
              </Typography>
            </Box>

            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    label="Mensagem"
                    value={newMessage.message}
                    onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Telefone do Destinatário"
                    value={newMessage.recipient_phone}
                    onChange={handlePhoneChange}
                    placeholder="(55) 55555-5555"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <DatePicker
                      label="Data do Evento"
                      value={newMessage.event_date ? new Date(newMessage.event_date) : null}
                      onChange={(newValue) => setNewMessage({ ...newMessage, event_date: newValue ? newValue.toISOString() : '' })}
                      slotProps={{ textField: { fullWidth: true, required: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Dias para Lembrete"
                    value={newMessage.reminder_days}
                    onChange={(e) => setNewMessage({ ...newMessage, reminder_days: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Enviar Mensagem
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Mensagens Enviadas
            </Typography>
            <Grid container spacing={2}>
              {messages.map((msg) => (
                <Grid item xs={12} key={msg.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="div">
                        Para: {msg.recipient_phone}
                      </Typography>
                      <Typography color="text.secondary" gutterBottom>
                        Data do Evento: {format(new Date(msg.event_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {msg.message}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 1 }}>
                        Status: {msg.status}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Enviado em: {format(new Date(msg.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};

export default Dashboard; 