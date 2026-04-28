import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'; 
import { Paper, Typography, TextField, Button, Alert, Box, CircularProgress, LinearProgress, Stack, Divider } from '@mui/material';
import '../../styles/StudentProfile.css'; 

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

    // STILURI PENTRU CĂSUȚE (UI Premium)
    const readOnlyInputStyle = {
        backgroundColor: '#f8fafc', 
        borderRadius: '10px',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
        '& .MuiInputBase-input': { color: '#718096', fontWeight: '500' } 
    };

    const editableInputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
        }
    };

    return (
        <div className="profile-container">
            {/* Am redus lățimea maximă la 700px pentru ca elementele stivuite vertical să arate perfect proporționate */}
            <Paper className="profile-paper" elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', maxWidth: '700px', margin: '0 auto', mt: 4, border: '1px solid #edf2f7', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                    <Typography variant="h4" sx={{ fontWeight: '800', color: '#1a202c', mb: 1 }}>
                        Profil Profesional
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#718096' }}>
                        Completează-ți profilul pentru a oferi încredere studenților din instituția ta.
                    </Typography>
                </Box>

                {/* BARA DE PROGRES */}
                <Box sx={{ mb: 5, backgroundColor: '#f0fdf4', p: 3, borderRadius: '16px', border: '1px solid #c6f6d5' }}>
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
                    {progress < 100 && (
                        <Typography variant="caption" sx={{ color: '#48bb78', display: 'block', mt: 1, fontWeight: '500' }}>
                            Adaugă datele lipsă pentru a atinge 100%.
                        </Typography>
                    )}
                </Box>

                {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 4, borderRadius: '12px' }}>{success}</Alert>}

                {/* --- SECȚIUNEA DATE AUTOMATE --- */}
                <Typography variant="subtitle1" sx={{ color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', mb: 3 }}>
                    Date de Identificare (Aprobate)
                </Typography>

                <Stack spacing={3}>
                    <TextField label="Nume" value={formData.last_name} fullWidth InputProps={{ readOnly: true }} sx={readOnlyInputStyle} />
                    <TextField label="Prenume" value={formData.first_name} fullWidth InputProps={{ readOnly: true }} sx={readOnlyInputStyle} />
                    <TextField label="Email" value={formData.email} fullWidth InputProps={{ readOnly: true }} sx={readOnlyInputStyle} />
                    <TextField label="Instituție" value={formData.institution_name} fullWidth InputProps={{ readOnly: true }} sx={readOnlyInputStyle} />
                </Stack>

                {/* Linie despărțitoare elegantă */}
                <Divider sx={{ my: 5, borderColor: '#edf2f7' }} />

                {/* --- SECȚIUNEA DATE EDITABILE --- */}
                <Typography variant="subtitle1" sx={{ color: '#2E8B57', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', mb: 3 }}>
                    Informații Publice (Editabile)
                </Typography>

                <Stack spacing={3}>
                    <TextField 
                        label="Titlu Profesional (ex: Psiholog Clinician)" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        fullWidth 
                        sx={editableInputStyle}
                    />
                    <TextField 
                        label="Specializare (ex: Terapie Cognitivă)" 
                        name="specialization" 
                        value={formData.specialization} 
                        onChange={handleChange} 
                        fullWidth 
                        sx={editableInputStyle}
                    />
                    <TextField 
                        label="Telefon de Contact" 
                        name="phone_number" 
                        value={formData.phone_number} 
                        onChange={handleChange} 
                        fullWidth 
                        sx={editableInputStyle}
                    />
                    <TextField 
                        label="Locație Cabinet (Sala / Adresa)" 
                        name="office_location" 
                        value={formData.office_location} 
                        onChange={handleChange} 
                        fullWidth 
                        sx={editableInputStyle}
                    />
                    <TextField 
                        label="Scurtă descriere (Bio)" 
                        name="bio" 
                        value={formData.bio} 
                        onChange={handleChange} 
                        fullWidth 
                        multiline 
                        rows={4} 
                        placeholder="Descrie cum ajuți studenții și care este abordarea ta terapeutică..."
                        sx={editableInputStyle}
                    />
                </Stack>

                {/* BUTOANE */}
                <Box sx={{ mt: 6, display: 'flex', gap: 2, justifyContent: 'flex-end', borderTop: '1px solid #edf2f7', pt: 4 }}>
                    <Button 
                        variant="outlined" 
                        onClick={() => navigate('/dashboard')}
                        sx={{ borderRadius: '12px', fontWeight: 'bold', color: '#4a5568', borderColor: '#e2e8f0', px: 3, '&:hover': { backgroundColor: '#f7fafc', borderColor: '#cbd5e0' } }}
                    >
                        Înapoi
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSave}
                        disabled={saving}
                        sx={{ 
                            backgroundColor: '#2E8B57', 
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            px: 4,
                            boxShadow: '0 4px 14px rgba(46, 139, 87, 0.4)',
                            '&:hover': { backgroundColor: '#1b4332', boxShadow: '0 6px 20px rgba(46, 139, 87, 0.6)' }
                        }}
                    >
                        {saving ? 'Se salvează...' : 'SALVEAZĂ MODIFICĂRILE'}
                    </Button>
                </Box>
            </Paper>
        </div>
    );
};

export default PsychologistProfilePage;