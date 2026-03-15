import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import { Container, Paper, TextField, Button, Typography, Box, Alert, MenuItem } from '@mui/material';
import '../styles/RegisterPage.css'; 

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '', 
    password: '', 
    first_name: '', 
    last_name: '',
    email: '', 
    role: 'STUDENT', 
    institution: ''
  });
  
  const [institutions, setInstitutions] = useState([]);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await api.get('institutions/');
        setInstitutions(res.data);
      } catch (err) {
        console.error("Eroare la încărcarea instituțiilor:", err);
      }
    };
    fetchInstitutions();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la înregistrare. Verifică datele.');
    }
  };

  return (
    <div className="register-page">
      <Container maxWidth="sm">
        <Paper className="register-paper" elevation={0}>
          <Typography variant="h4" className="register-title">
            Creează Cont
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}

          <form onSubmit={handleSubmit} className="register-form" autocomplete="off">
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="Prenume" 
                name="first_name" 
                fullWidth 
                required 
                onChange={handleChange} 
                className="register-input" 
              />
              <TextField 
                label="Nume" 
                name="last_name" 
                fullWidth 
                required 
                onChange={handleChange} 
                className="register-input" 
              />
            </Box>
            
            <TextField 
              label="Utilizator" 
              name="username" 
              fullWidth 
              required 
              onChange={handleChange} 
              className="register-input" 
              autoComplete="off"
            />
            
            <TextField 
              label="Email" 
              name="email" 
              type="email" 
              fullWidth 
              required 
              onChange={handleChange} 
              className="register-input" 
            />
            
            <TextField 
              label="Parolă" 
              name="password" 
              type="password" 
              fullWidth 
              required 
              onChange={handleChange} 
              className="register-input"
              autoComplete="new-password" 
            />
            
            <TextField
              select
              label="Instituție"
              name="institution"
              fullWidth
              required
              value={formData.institution}
              onChange={handleChange}
              className="register-input"
            >
              {institutions.map((inst) => (
                <MenuItem key={inst.id} value={inst.id}>
                  {inst.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Sunt un:"
              name="role"
              fullWidth
              value={formData.role}
              onChange={handleChange}
              className="register-input"
            >
              <MenuItem value="STUDENT">Student / Elev</MenuItem>
              <MenuItem value="PSYCHOLOGIST">Psiholog</MenuItem>
            </TextField>

            <Button 
              type="submit" 
              className="register-button" 
              fullWidth 
              variant="contained"
            >
              SIGN UP
            </Button>
          </form>
          
          <Box className="register-footer">
            Ai deja cont? <Link to="/login" className="register-link">LOGIN</Link>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default RegisterPage;