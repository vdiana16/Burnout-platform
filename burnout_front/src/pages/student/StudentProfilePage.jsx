import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'; 
import { Paper, Typography, TextField, Button, MenuItem, Alert, Box, LinearProgress } from '@mui/material';
import { useAuth } from '../../auth/AuthContext'; 
import '../../styles/StudentProfile.css'; 

const StudentProfilePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); 
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [assignedPsychologist, setAssignedPsychologist] = useState(null);

    const [formData, setFormData] = useState({
        age: '',
        education_level: '',
        study_stage: '',
        field: '',
        academic_gpa: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('access');
                const response = await api.get('/students/me/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.data) {
                    const data = response.data;
                    setFormData({
                        age: data.age || '',
                        education_level: data.education_level || '',
                        study_stage: data.study_stage || '',
                        field: data.field || '',
                        academic_gpa: data.academic_gpa || '',
                    });

                    if (data.assigned_psychologist) {
                        setAssignedPsychologist(data.assigned_psychologist);
                    }
                }
            } catch (err) {
                console.error("Eroare la încărcare:", err);
                setError('Nu am putut încărca datele profilului.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('access');
            await api.patch('/students/me/', formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSuccess('Profilul a fost actualizat cu succes!');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError('Eroare la salvarea datelor.');
        } finally {
            setSaving(false);
        }
    };

    const calculateProgress = () => {
        const fieldsToCheck = ['age', 'education_level', 'study_stage', 'academic_gpa', 'field'];
        let filledCount = 0;
        fieldsToCheck.forEach(field => {
            if (formData[field] !== null && formData[field] !== undefined && String(formData[field]).trim() !== '') {
                filledCount++;
            }
        });
        return (filledCount / fieldsToCheck.length) * 100;
    };

    const progress = calculateProgress();

    const handleBackToDashboard = () => {
        if (!formData.age || !formData.academic_gpa || formData.age === '' || formData.academic_gpa === '') {
            setError('Pentru a accesa Dashboard-ul trebuie să îți completezi profilul.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        navigate('/dashboard');
    };

    if (loading) return <Typography sx={{ p: 4, textAlign: 'center' }}>Se încarcă...</Typography>;

    return (
        <div className="profile-page-container">
            <Paper className="profile-card-paper" elevation={0}>
                <Typography variant="h4" className="profile-header-title">Profil Student</Typography>
                
                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

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

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        
                        <Typography className="profile-section-title">📧 Informații Cont (Read-Only)</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField label="Nume Complet" fullWidth value={`${user?.first_name} ${user?.last_name}`} InputProps={{ readOnly: true }} sx={{ bgcolor: '#f8fafc' }} />
                            <TextField label="Email" fullWidth value={user?.email} InputProps={{ readOnly: true }} sx={{ bgcolor: '#f8fafc' }} />
                            <TextField label="Psiholog / Instituție" fullWidth value={assignedPsychologist ? `${assignedPsychologist.first_name} ${assignedPsychologist.last_name} (${user?.institution_name})` : 'Nespecificat'} InputProps={{ readOnly: true }} sx={{ bgcolor: '#f8fafc' }} />
                        </Box>

                        <Typography className="profile-section-title">🎓 Detalii Academice</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField label="Vârstă" name="age" type="number" fullWidth value={formData.age} onChange={handleChange} required />
                                <TextField label="Medie (GPA)" name="academic_gpa" type="number" fullWidth value={formData.academic_gpa} onChange={handleChange} required />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField select label="Nivel Educație" name="education_level" fullWidth value={formData.education_level} onChange={handleChange}>
                                    <MenuItem value="Liceu">Liceu</MenuItem>
                                    <MenuItem value="Licență">Licență</MenuItem>
                                    <MenuItem value="Master">Master</MenuItem>
                                </TextField>
                                <TextField select label="An de studiu" name="study_stage" fullWidth value={formData.study_stage} onChange={handleChange}>
                                    <MenuItem value="Anul 1">Anul 1</MenuItem>
                                    <MenuItem value="Anul 2">Anul 2</MenuItem>
                                    <MenuItem value="Anul 3">Anul 3</MenuItem>
                                    <MenuItem value="Anul 4+">Anul 4+</MenuItem>
                                </TextField>
                            </Box>
                            <TextField select label="Domeniu" name="field" fullWidth value={formData.field} onChange={handleChange}>
                                <MenuItem value="Real">Real / Inginerie / Științe Exacte</MenuItem>
                                <MenuItem value="Uman">Uman / Social / Litere / Psihologie</MenuItem>
                                <MenuItem value="Medicină">Medicină / Sănătate</MenuItem>
                                <MenuItem value="Economic">Economic / Business</MenuItem>
                                <MenuItem value="Vocațional">Vocațional / Arte / Sport</MenuItem>
                            </TextField>
                        </Box>

                        {/* BUTOANE UNIFICATE */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 4 }}>
                            <Button type="submit" fullWidth className="btn-save-profile" disabled={saving}>
                                {saving ? 'SE SALVEAZĂ...' : 'SALVEAZĂ PROFILUL'}
                            </Button>
                            <Button variant="text" fullWidth className="btn-back-profile" onClick={handleBackToDashboard}>
                                Înapoi la Dashboard
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Paper>
        </div>
    );
};

export default StudentProfilePage;