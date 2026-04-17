import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'; 
import { Paper, Typography, TextField, Button, Alert, Box, CircularProgress } from '@mui/material';
// Refolosim stilul de la student pentru a păstra identitatea vizuală a platformei
import '../../styles/StudentProfile.css'; 

const PsychologistProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        institution_name: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Ruta pe care am definit-o în urls.py
                const response = await api.get('/psychologists/me/');
                
                if (response.data) {
                    const { user, institution } = response.data;
                    setFormData({
                        first_name: user.first_name || '',
                        last_name: user.last_name || '',
                        email: user.email || '',
                        institution_name: institution ? institution.name : 'Nespecificată'
                    });
                }
            } catch (err) {
                console.error("Eroare la preluarea profilului:", err);
                setError('Nu am putut încărca datele profilului tău.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress color="success" />
            </Box>
        );
    }

    return (
        <div className="profile-container" style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
            <Paper elevation={3} className="profile-paper" sx={{ p: 4, borderRadius: '24px', border: '1px solid #edf2f7' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>👨‍⚕️</div>
                    <Typography variant="h4" sx={{ fontWeight: '800', color: '#2E8B57' }}>
                        Profil Profesional
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#718096', mt: 1 }}>
                        Informațiile tale de specialist în cadrul platformei.
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <Box sx={{ display: 'grid', gap: 3 }}>
                    <TextField 
                        label="Prenume" 
                        fullWidth 
                        value={formData.first_name} 
                        variant="filled"
                        InputProps={{ readOnly: true }}
                        helperText="Prenumele este preluat din contul de utilizator."
                    />
                    
                    <TextField 
                        label="Nume" 
                        fullWidth 
                        value={formData.last_name} 
                        variant="filled"
                        InputProps={{ readOnly: true }}
                    />

                    <TextField 
                        label="Adresă Email" 
                        fullWidth 
                        value={formData.email} 
                        variant="filled"
                        InputProps={{ readOnly: true }}
                    />

                    <TextField 
                        label="Instituție Asociată" 
                        fullWidth 
                        value={formData.institution_name} 
                        variant="filled"
                        InputProps={{ readOnly: true }}
                        sx={{ mb: 2 }}
                    />

                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            onClick={() => navigate('/dashboard')}
                            sx={{ 
                                backgroundColor: '#2E8B57', 
                                py: 1.5, 
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                '&:hover': { backgroundColor: '#1b4332' }
                            }}
                        >
                            ÎNAPOI LA DASHBOARD
                        </Button>

                        <Typography variant="caption" sx={{ textAlign: 'center', color: '#a0aec0' }}>
                            Dacă dorești să modifici aceste date, te rugăm să contactezi administratorul instituției.
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </div>
    );
};

export default PsychologistProfilePage;