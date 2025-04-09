import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openRegister, setOpenRegister] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [registerData, setRegisterData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [registerError, setRegisterError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setPhone(formattedPhone);
  };

  const handleRegisterPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setRegisterData({ ...registerData, phone: formattedPhone });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const formData = new FormData();
      formData.append('phone', phone.replace(/\D/g, ''));
      formData.append('password', password);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/login`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciais inválidas');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('As senhas não coincidem');
      return;
    }

    if (registerData.password.length < 8) {
      setRegisterError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('first_name', registerData.first_name);
      formData.append('last_name', registerData.last_name);
      formData.append('phone', registerData.phone.replace(/\D/g, ''));
      formData.append('password', registerData.password);

      await axios.post(
        `${process.env.REACT_APP_API_URL}/register`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      setOpenRegister(false);
      setShowSuccessMessage(true);
      setRegisterData({
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setRegisterError(err.response?.data?.detail || 'Erro ao criar usuário');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
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
          <Typography component="h1" variant="h5">
            Login
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="phone"
              label="Telefone"
              name="phone"
              autoComplete="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(55) 55555-5555"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                                          aria-label="toggle password visibility"

                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Entrar
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOpenRegister(true)}
            >
              Criar Novo Usuário
            </Button>
          </Box>
        </Paper>
      </Box>

      <Dialog open={openRegister} onClose={() => setOpenRegister(false)}>
        <DialogTitle>Criar Novo Usuário</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleRegister} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="first_name"
                  required
                  fullWidth
                  id="first_name"
                  label="Nome"
                  autoFocus
                  value={registerData.first_name}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, first_name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="last_name"
                  label="Sobrenome"
                  name="last_name"
                  autoComplete="family-name"
                  value={registerData.last_name}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, last_name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="phone"
                  label="Telefone"
                  name="phone"
                  autoComplete="tel"
                  value={registerData.phone}
                  onChange={handleRegisterPhoneChange}
                  placeholder="(55) 55555-5555"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Senha"
                  type={showRegisterPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, password: e.target.value })
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          edge="end"
                        >
                          {showRegisterPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirmar Senha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, confirmPassword: e.target.value })
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            {registerError && (
              <Typography color="error" sx={{ mt: 1 }}>
                {registerError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRegister(false)}>Cancelar</Button>
          <Button onClick={handleRegister} variant="contained">
            Criar Usuário
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccessMessage(false)} severity="success" sx={{ width: '100%' }}>
          Usuário cadastrado com sucesso!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login; 