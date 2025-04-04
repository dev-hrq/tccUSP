import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#697565',
    },
    secondary: {
      main: '#3C3D37',
    },
    background: {
      default: '#ECDFCC',
      paper: '#ECDFCC',
    },
    text: {
      primary: '#181C14',
      secondary: '#3C3D37',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme; 