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
  
  const { login, isAuthenticated } = useAuth(); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(credentials); 
      
      const token = localStorage.getItem('access');

      try {
        const profileResponse = await fetch('http://127.0.0.1:8000/api/student/profile/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (profileResponse.status === 404) {
          navigate('/student-profile');
        } else {
          navigate('/dashboard');
        }
      } catch (profileErr) {
        navigate('/dashboard');
      }

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
              type={showPassword ? "text" : "password"} 
              className="login-input"
              fullWidth
              required
              onChange={handleChange}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
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