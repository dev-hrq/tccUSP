import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('user') !== null;

  const handleLogout = async () => {
    try {
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          NotifyX
        </Typography>
        <Box>
          {isLoggedIn ? (
            <Button color="inherit" onClick={handleLogout}>
              Sair
            </Button>
          ) : (
            <Button 
              color="inherit" 
              onClick={() => navigate('/')}
              disabled={location.pathname === '/'}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 