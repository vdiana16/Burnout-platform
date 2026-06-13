/**
 * RegisterPage.jsx
 * @description Gestionează înregistrarea utilizatorilor noi studenți(elevi)/psihologi.
 * Implementează validări complexe, sugestii automate pentru instituții și
 * tratarea erorilor de la API.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import { 
  Container, Paper, TextField, Button, Typography, Box, Alert, MenuItem, 
  IconButton, InputAdornment, Autocomplete 
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import '../styles/RegisterPage.css';
import { validateRegisterForm } from '../validators/userValidator'; 

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '', 
    password: '', 
    retype_password: '', 
    first_name: '', 
    last_name: '',
    email: '', 
    role: 'STUDENT', 
    institution: ''
  });
  
  const [institutions, setInstitutions] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Preluarea listei de instituții la montarea componentei pentru dropdown/autocomplete
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
    
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validare locală înainte de trimiterea cererii HTTP
    setGeneralError('');
    
    const validationErrors = validateRegisterForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return; 
    }

    try {
      const dataToSend = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        institution_name: formData.institution
      };      
      
      const success = await register(dataToSend);
      
      if (success) {
        navigate('/login'); 
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const serverErrors = err.response.data;
        
        if (serverErrors.username && serverErrors.username[0].includes("already exists")) {
          serverErrors.username = "Acest nume de utilizator este deja folosit.";
        }
        if (serverErrors.password) {
          serverErrors.password = "Parola nu respectă cerințele de securitate ale serverului.";
        }
        
        setFieldErrors(serverErrors);
      } else {
        setGeneralError('Eroare de server. Încercați mai târziu.');
      }
    }
  };

  const getErrorText = (fieldName) => {
    if (fieldErrors[fieldName]) {
      return Array.isArray(fieldErrors[fieldName]) 
        ? fieldErrors[fieldName][0] 
        : fieldErrors[fieldName];
    }
    return '';
  };

  return (
    <div className="register-page">
      <Container maxWidth="sm">
        <Paper className="register-paper" elevation={0}>
          <Typography variant="h4" className="register-title">
            Înregistrare
          </Typography>
          
          {generalError && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{generalError}</Alert>}

          <form onSubmit={handleSubmit} className="register-form" noValidate autoComplete="off">
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="Prenume" 
                name="first_name" 
                fullWidth 
                required 
                InputLabelProps={{ required: false }}
                onChange={handleChange} 
                className="register-input" 
                error={!!fieldErrors.first_name}
                helperText={getErrorText('first_name')}
              />
              <TextField 
                label="Nume" 
                name="last_name" 
                fullWidth 
                required 
                InputLabelProps={{ required: false }}
                onChange={handleChange} 
                className="register-input" 
                error={!!fieldErrors.last_name}
                helperText={getErrorText('last_name')}
              />
            </Box>
            
            <TextField 
              label="Utilizator" 
              name="username" 
              fullWidth 
              required 
              InputLabelProps={{ required: false }}
              onChange={handleChange} 
              className="register-input" 
              autoComplete="off"
              error={!!fieldErrors.username}
              helperText={getErrorText('username')}
            />
            
            <TextField 
              label="Email" 
              name="email" 
              type="email" 
              fullWidth 
              required 
              InputLabelProps={{ required: false }}
              onChange={handleChange} 
              className="register-input" 
              error={!!fieldErrors.email}
              helperText={getErrorText('email')}
            />
            
            <TextField 
              label="Parolă" 
              name="password" 
              type={showPassword ? "text" : "password"} 
              fullWidth 
              required 
              InputLabelProps={{ required: false }}
              onChange={handleChange} 
              className="register-input"
              autoComplete="new-password" 
              error={!!fieldErrors.password}
              helperText={getErrorText('password')}
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

            <TextField 
              label="Confirmă Parola" 
              name="retype_password" 
              type={showRetypePassword ? "text" : "password"} 
              fullWidth 
              required 
              InputLabelProps={{ required: false }}
              onChange={handleChange} 
              className="register-input"
              autoComplete="new-password" 
              error={!!fieldErrors.retype_password}
              helperText={getErrorText('retype_password')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowRetypePassword(!showRetypePassword)}
                      edge="end"
                    >
                      {showRetypePassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Autocomplete
              freeSolo
              options={institutions.map((inst) => inst.name)}
              value={formData.institution}
              onInputChange={(event, newInputValue) => {
                setFormData({ ...formData, institution: newInputValue });
                if (fieldErrors.institution) {
                  setFieldErrors({ ...fieldErrors, institution: null });
                }
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Instituție (Alege sau scrie una nouă)" 
                  className="register-input"
                  required
                  InputLabelProps={{ required: false }}
                  error={!!fieldErrors.institution}
                  helperText={getErrorText('institution')}
                />
              )}
            />

            <TextField
              select
              label="Sunt un:"
              name="role"
              fullWidth
              value={formData.role}
              onChange={handleChange}
              className="register-input"
              error={!!fieldErrors.role}
              helperText={getErrorText('role')}
            >
              <MenuItem value="STUDENT">Student / Elev</MenuItem>
              <MenuItem value="PSYCHOLOGIST">Psiholog</MenuItem>
            </TextField>

            <Button type="submit" className="register-button" fullWidth variant="contained">
              Creează cont
            </Button>
          </form>
          
          <Box className="register-footer">
            Ai deja cont? <Link to="/login" className="register-link">Conectează-te</Link>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default RegisterPage;