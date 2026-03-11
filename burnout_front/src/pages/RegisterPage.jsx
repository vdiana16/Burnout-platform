import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, TextField, Button, 
  Paper, Alert, MenuItem, FormControl, InputLabel, Select, 
  FormControlLabel, Radio, RadioGroup, FormLabel 
} from '@mui/material';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'STUDENT',
    institution_id: ''
  });
  const [institutions, setInstitutions] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await api.get('institutions/');
        setInstitutions(response.data);
      } catch (err) {
        console.error("Eroare la incarcarea institutiilor", err);
      }
    };
    fetchInstitutions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('register/', formData);
      alert("Cont creat! Acum te poti loga.");
      navigate('/login');
    } catch (err) {
      setError('Eroare: Verifică dacă datele sunt corecte.');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
            Creează Cont
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField fullWidth label="Prenume" required onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
              <TextField fullWidth label="Nume" required onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
            </Box>

            <TextField fullWidth label="Utilizator" required sx={{ mb: 2 }} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
            <TextField fullWidth label="Email" type="email" required sx={{ mb: 2 }} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <TextField fullWidth label="Parolă" type="password" required sx={{ mb: 2 }} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Instituție</InputLabel>
              <Select
                value={formData.institution_id}
                label="Instituție"
                onChange={(e) => setFormData({ ...formData, institution_id: e.target.value })}
                required
              >
                {institutions.map((inst) => (
                  <MenuItem key={inst.id} value={inst.id}>{inst.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Sunt un:</FormLabel>
              <RadioGroup row value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <FormControlLabel value="STUDENT" control={<Radio />} label="Student/Elev" />
                <FormControlLabel value="PSYCHOLOGIST" control={<Radio />} label="Psiholog" />
              </RadioGroup>
            </FormControl>

            <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 2, mb: 2 }}>
              Finalizare Înregistrare
            </Button>

            <Typography variant="body2" align="center">
              Ai deja cont? <Button onClick={() => navigate('/login')}>Login</Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;