/**
 * LoginPage.jsx
 * @description Gestionează interfața de autentificare și fluxul post-login.
 * Implementează validări de stare, vizibilitatea parolei și redirecționarea 
 * inteligentă către profilul utilizatorului sau dashboard.
 */
import React, { useState, useEffect } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Container, Paper, TextField, Button, Typography, Box, Alert, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const loggedInUser = await login(credentials); 
      const token = localStorage.getItem('access');
      
      const savedUserString = localStorage.getItem('user');
      const fallbackUser = savedUserString && savedUserString !== 'undefined' ? JSON.parse(savedUserString) : null;
      
      const finalUser = loggedInUser || fallbackUser;
      
      const role = finalUser?.role?.toLowerCase();
      
      console.log("Date User:", finalUser);
      console.log("Rol Detectat:", role);

      if (role === 'psychologist') {
        try {
          const res = await fetch('http://127.0.0.1:8000/api/psychologists/me/', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.status === 404) navigate('/psychologist-profile');
          else navigate('/dashboard');
        } catch (err) {
          navigate('/dashboard');
        }
      } else {
        try {
          const res = await fetch('http://127.0.0.1:8000/api/students/me/', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.status === 404) navigate('/student-profile');
          else navigate('/dashboard');
        } catch (err) {
          navigate('/dashboard');
        }
      }

    } catch (err) {
      setError('Credențiale invalide. Te rugăm să încerci din nou.');
    }
  };

  return (
    <div className="login-page">
      <Container maxWidth="xs">
        <Paper className="login-paper" elevation={0}>
          <Typography variant="h4" className="login-title">Aplicație pentru evaluarea riscului de burnout</Typography>
          <Typography variant="body2" className="login-subtitle">Conectează-te în contul tău</Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit} className="login-form" autoComplete="off" noValidate>
            <TextField
              label="Utilizator"
              name="username"
              className="login-input"
              fullWidth
              required
              InputLabelProps={{ required: false }}
              onChange={handleChange}
              autoComplete="off"
            />
            <TextField
              label="Parolă"
              name="password"
              type={showPassword ? "text" : "password"} 
              className="login-input"
              fullWidth
              required
              InputLabelProps={{ required: false }}
              onChange={handleChange}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button type="submit" className="login-button" fullWidth variant="contained">
              Conectează-te
            </Button>
          </form>
          
          <Box className="login-footer">
            Nu ai un cont? <Link to="/register" className="login-link">Înregistrează-te</Link>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default LoginPage;