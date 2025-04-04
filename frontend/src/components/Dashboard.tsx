import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogContent,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Grid,
  InputAdornment,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Dashboard: React.FC = () => {
  const [message, setMessage] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [reminderDays, setReminderDays] = useState(1);
  const [wantReminder, setWantReminder] = useState(false);
  const [showRecipientId, setShowRecipientId] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o usuário está logado
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Recuperar informações do usuário
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.first_name);
    }
  }, [navigate]);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setRecipientId(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/messages`,
        {
          text: message,
          recipient_id: recipientId,
          event_date: eventDate,
          reminder_days: reminderDays.toString(),
          want_reminder: wantReminder,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setMessage('');
      setRecipientId('');
      setEventDate('');
      setReminderDays(0);
      setWantReminder(false);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonIcon />
            <Typography variant="body1">Usuário Logado: {userName}</Typography>
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Nova Mensagem
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Mensagem"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              margin="normal"
            />
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefone do Destinatário"
                  value={recipientId}
                  onChange={handlePhoneChange}
                  margin="normal"
                  placeholder="(55) 55555-5555"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data do Evento"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Dias anterior para o Lembrete"
                  value={reminderDays}
                  onChange={(e) => setReminderDays(parseInt(e.target.value))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={wantReminder}
                      onChange={(e) => setWantReminder(e.target.checked)}
                    />
                  }
                  label="Quero também receber o lembrete"
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: '' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Enviar Mensagem
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>

      <Dialog open={loading}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Processando...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 