import React, { useState, useEffect } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  
  const { login, isAuthenticated } = useAuth(); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (err) {
      setError('Credentiale invalide. Te rugam sa încerci din nou.');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="login-page">
      <Container maxWidth="xs">
        <Paper className="login-paper" elevation={0}>
          <Typography variant="h4" className="login-title">Burnout App</Typography>
          <Typography variant="body2" className="login-subtitle">Conectează-te la contul tău</Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
            <TextField
              label="Utilizator"
              name="username"
              className="login-input"
              fullWidth
              required
              onChange={handleChange}
              autoComplete="off"
            />
            <TextField
              label="Parolă"
              name="password"
              type="password"
              className="login-input"
              fullWidth
              required
              onChange={handleChange}
              autoComplete="new-password"
            />
            <Button type="submit" className="login-button" fullWidth variant="contained">
              Login
            </Button>
          </form>
          
          <Box className="login-footer">
            Nu ai un cont? <Link to="/register" className="login-link">SIGN UP</Link>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default LoginPage;