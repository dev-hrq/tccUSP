import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Grid,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ptBR } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [reminderDays, setReminderDays] = useState(0);
  const [wantReminder, setWantReminder] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setRecipientId(formattedPhone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!eventDate) {
      setError('Por favor, selecione uma data para o evento');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/messages`,
        {
          text: message,
          recipient_id: recipientId.replace(/\D/g, ''),
          event_date: eventDate.toISOString(),
          reminder_days: reminderDays,
          want_reminder: wantReminder,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setSuccess('Mensagem agendada com sucesso!');
      setMessage('');
      setRecipientId('');
      setEventDate(null);
      setReminderDays(0);
      setWantReminder(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao agendar mensagem');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
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
                  value={recipientId}
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
                    sx={{ width: '100%' }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Dias para Lembrete"
                  value={reminderDays}
                  onChange={(e) => setReminderDays(Number(e.target.value))}
                  InputProps={{
                    inputProps: { min: 0 },
                  }}
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
            {success && (
              <Typography color="success.main" sx={{ mt: 1 }}>
                {success}
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard; 