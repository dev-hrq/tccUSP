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
import { createMessage, getMessages } from '../services/api';
import { format } from 'date-fns';

interface Message {
  id: string;
  recipient_phone: string;
  message: string;
  event_date: string;
  reminder_days: number;
  status: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [reminderDays, setReminderDays] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Verificar se há token
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Carregar mensagens
    loadMessages();
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

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setRecipientPhone(formattedPhone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!message || !recipientPhone || !eventDate || !reminderDays) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      // Verificar se há token antes de enviar
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await createMessage({
        recipient_phone: recipientPhone.replace(/\D/g, ''),
        message,
        event_date: eventDate.toISOString(),
        reminder_days: parseInt(reminderDays),
      });

      setMessage('');
      setRecipientPhone('');
      setEventDate(null);
      setReminderDays('');
      setShowSuccess(true);
      loadMessages();
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err);
      if (err.response?.status === 401) {
        // Token inválido ou expirado
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || 'Erro ao enviar mensagem');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Container component="main" maxWidth="md">
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
              Bem-vindo, {user.first_name}!
            </Typography>
            <Button variant="outlined" onClick={handleLogout}>
              Sair
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  label="Mensagem"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Telefone do Destinatário"
                  value={recipientPhone}
                  onChange={handlePhoneChange}
                  placeholder="(55) 55555-5555"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data do Evento"
                    value={eventDate}
                    onChange={(newValue) => setEventDate(newValue)}
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
                  value={reminderDays}
                  onChange={(e) => setReminderDays(e.target.value)}
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
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
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
                      Para: {formatPhoneNumber(msg.recipient_phone)}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      Data do Evento: {new Date(msg.event_date).toLocaleDateString('pt-BR')}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {msg.message}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      Status: {msg.status}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Enviado em: {new Date(msg.created_at).toLocaleString('pt-BR')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Mensagem enviada com sucesso!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard; 