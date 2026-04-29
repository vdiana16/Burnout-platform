import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'; 
import { Paper, Typography, TextField, Button, Alert, Box, CircularProgress, LinearProgress, Stack, Divider } from '@mui/material';
import '../../styles/StudentProfile.css'; // Folosim același fișier CSS

const PsychologistProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        institution_name: '',
        title: '',
        specialization: '',
        phone_number: '',
        office_location: '',
        bio: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('access');
                const response = await api.get('/psychologists/me/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.data) {
                    setFormData({
                        first_name: response.data.first_name || '',
                        last_name: response.data.last_name || '',
                        email: response.data.email || '',
                        institution_name: response.data.institution_name || 'Nespecificată',
                        title: response.data.title || '',
                        specialization: response.data.specialization || '',
                        phone_number: response.data.phone_number || '',
                        office_location: response.data.office_location || '',
                        bio: response.data.bio || ''
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

    const calculateProgress = () => {
        const fieldsToCheck = ['title', 'specialization', 'phone_number', 'office_location', 'bio'];
        let filledCount = 0;
        fieldsToCheck.forEach(field => {
            if (formData[field] && formData[field].trim() !== '') filledCount++;
        });
        return (filledCount / fieldsToCheck.length) * 100;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSuccess(''); 
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        
        try {
            const token = localStorage.getItem('access');
            await api.patch('/psychologists/me/', {
                title: formData.title,
                specialization: formData.specialization,
                phone_number: formData.phone_number,
                office_location: formData.office_location,
                bio: formData.bio
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setSuccess('Profilul a fost actualizat cu succes!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error("Eroare la salvare:", err);
            setError('A apărut o eroare la salvarea datelor.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress color="success" /></Box>;

    const progress = calculateProgress();

    return (
        <div className="profile-page-container">
            <Paper className="profile-card-paper" elevation={0}>
                
                <Typography variant="h4" className="profile-header-title">
                    Profil Profesional
                </Typography>
                <Typography variant="body1" sx={{ color: '#718096', textAlign: 'center', mb: 4, mt: -2 }}>
                    Completează-ți profilul pentru a oferi încredere studenților din instituția ta.
                </Typography>

                {/* BARA DE PROGRES RĂMÂNE - E O IDEE EXCELENTĂ */}
                <Box sx={{ mb: 4, backgroundColor: '#f0fdf4', p: 3, borderRadius: '16px', border: '1px solid #c6f6d5' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: '800', color: progress === 100 ? '#276749' : '#2f855a' }}>
                            {progress === 100 ? '✨ Profil Complet (100%)' : `Completare Profil (${progress}%)`}
                        </Typography>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ height: 10, borderRadius: 5, backgroundColor: '#c6f6d5', '& .MuiLinearProgress-bar': { backgroundColor: '#38a169' } }} 
                    />
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

                <form>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        
                        {/* --- SECȚIUNEA DATE AUTOMATE --- */}
                        <Typography className="profile-section-title">📧 Date de Identificare (Aprobate)</Typography>
                        <Stack spacing={2}>
                            <TextField label="Nume" value={formData.last_name} fullWidth InputProps={{ readOnly: true }} sx={{ bgcolor: '#f8fafc' }} />
                            <TextField label="Prenume" value={formData.first_name} fullWidth InputProps={{ readOnly: true }} sx={{ bgcolor: '#f8fafc' }} />
                            <TextField label="Email" value={formData.email} fullWidth InputProps={{ readOnly: true }} sx={{ bgcolor: '#f8fafc' }} />
                            <TextField label="Instituție" value={formData.institution_name} fullWidth InputProps={{ readOnly: true }} sx={{ bgcolor: '#f8fafc' }} />
                        </Stack>

                        <Divider sx={{ my: 2, borderColor: '#edf2f7' }} />

                        {/* --- SECȚIUNEA DATE EDITABILE --- */}
                        <Typography className="profile-section-title">💼 Informații Publice (Editabile)</Typography>
                        <Stack spacing={2}>
                            <TextField label="Titlu Profesional (ex: Psiholog Clinician)" name="title" value={formData.title} onChange={handleChange} fullWidth />
                            <TextField label="Specializare (ex: Terapie Cognitivă)" name="specialization" value={formData.specialization} onChange={handleChange} fullWidth />
                            <TextField label="Telefon de Contact" name="phone_number" value={formData.phone_number} onChange={handleChange} fullWidth />
                            <TextField label="Locație Cabinet (Sala / Adresa)" name="office_location" value={formData.office_location} onChange={handleChange} fullWidth />
                            <TextField label="Scurtă descriere (Bio)" name="bio" value={formData.bio} onChange={handleChange} fullWidth multiline rows={4} placeholder="Descrie abordarea ta terapeutică..." />
                        </Stack>

                        {/* BUTOANE UNIFICATE */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 4 }}>
                            <Button 
                                variant="contained" 
                                fullWidth
                                className="btn-save-profile" 
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'SE SALVEAZĂ...' : 'SALVEAZĂ PROFILUL'}
                            </Button>

                            <Button 
                                variant="text" 
                                fullWidth
                                className="btn-back-profile" 
                                onClick={() => navigate('/dashboard')}
                            >
                                Înapoi la Dashboard
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Paper>
        </div>
    );
};

export default PsychologistProfilePage;