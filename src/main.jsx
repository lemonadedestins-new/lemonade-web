import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App';
import './styles/tokens.css';
import './styles/global.css';

const theme = createTheme({
  palette: { primary: { main: '#234a3c' }, secondary: { main: '#ebd779' }, error: { main: '#b43b39' }, background: { default: '#fdfcf8', paper: '#ffffff' } },
  typography: { fontFamily: '"DM Sans", Arial, sans-serif', button: { textTransform: 'none', fontWeight: 600 } },
  shape: { borderRadius: 12 },
  components: { MuiButton: { defaultProps: { disableElevation: true } }, MuiTextField: { defaultProps: { fullWidth: true, variant: 'outlined' } } },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><ThemeProvider theme={theme}><BrowserRouter><App /></BrowserRouter></ThemeProvider></React.StrictMode>,
);
