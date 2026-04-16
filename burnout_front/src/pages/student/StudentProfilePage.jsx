import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'; 
import { Paper, Typography, TextField, Button, MenuItem, Alert, Box } from '@mui/material';
import '../../styles/StudentProfile.css'; 

const StudentProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        age: '',
        education_level: 'Liceu',
        study_stage: 'Anul 1',
        field: 'Real',
        academic_gpa: '',
        employment: 'Nu'
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('access');
                const response = await api.get('/student/profile/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.data) {
                    const data = response.data;
                    setFormData({
                        age: data.age || '',
                        education_level: data.education_level || 'Liceu',
                        study_stage: data.study_stage || 'Anul 1',
                        field: data.field || 'Real',
                        academic_gpa: data.academic_gpa || '',
                        employment: data.employment || 'Nu'
                    });
                }
            } catch (err) {
                console.log("Profil nou sau eroare la încărcare:", err);
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
        try {
            const token = localStorage.getItem('access'); 
            
            await api.patch('/student/profile/', formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setSuccess("Profilul tău a fost actualizat cu succes!");
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            console.error("Eroare la salvare:", err.response?.data);
            setError("A apărut o eroare. Verifică datele introduse.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="profile-page-container">
            <Typography>Se încarcă profilul...</Typography>
        </div>
    );

    return (
        <div className="profile-page-container">
            <Paper className="profile-card-paper">
                <Typography variant="h4" className="profile-header-title">
                    Profilul Academic
                </Typography>
                <Typography variant="body1" className="profile-header-subtitle">
                    Informații de bază pentru personalizarea experienței tale.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        
                        <div className="form-row-double">
                            <TextField 
                                fullWidth label="Vârstă" name="age" type="number" required 
                                value={formData.age} onChange={handleChange} 
                            />
                            <TextField 
                                fullWidth label="Media Academică" name="academic_gpa" type="number" 
                                inputProps={{ step: "0.01", min: "1", max: "10" }} required 
                                value={formData.academic_gpa} onChange={handleChange} 
                            />
                        </div>

                        <TextField 
                            select fullWidth label="Nivel Educație" name="education_level" 
                            value={formData.education_level} onChange={handleChange}
                        >
                            <MenuItem value="Liceu">Liceu</MenuItem>
                            <MenuItem value="Licență">Licență</MenuItem>
                            <MenuItem value="Master">Master</MenuItem>
                            <MenuItem value="Doctorat">Doctorat</MenuItem>
                        </TextField>

                        <TextField 
                            select fullWidth label="Anul de studiu" name="study_stage" 
                            value={formData.study_stage} onChange={handleChange}
                        >
                            <MenuItem value="Anul 1">Anul 1</MenuItem>
                            <MenuItem value="Anul 2">Anul 2</MenuItem>
                            <MenuItem value="Anul 3">Anul 3</MenuItem>
                            <MenuItem value="An Terminal">An Terminal</MenuItem>
                        </TextField>

                        <TextField 
                            select fullWidth label="Domeniul de studiu" name="field" 
                            value={formData.field} onChange={handleChange}
                        >
                            <MenuItem value="Real">Real / Inginerie / Științe Exacte</MenuItem>
                            <MenuItem value="Uman">Uman / Social / Litere / Psihologie</MenuItem>
                            <MenuItem value="Medicină">Medicină / Sănătate</MenuItem>
                            <MenuItem value="Economic">Economic / Business</MenuItem>
                            <MenuItem value="Vocațional">Vocațional / Arte / Sport</MenuItem>
                        </TextField>

                        <TextField 
                            select fullWidth label="Situație Profesională" name="employment" 
                            value={formData.employment} onChange={handleChange}
                        >
                            <MenuItem value="Nu">Nu lucrez</MenuItem>
                            <MenuItem value="Part-time">Lucrez Part-time</MenuItem>
                            <MenuItem value="Full-time">Lucrez Full-time</MenuItem>
                        </TextField>

                        <Button 
                            type="submit" 
                            fullWidth 
                            className="btn-save-profile"
                            disabled={saving}
                            sx={{ mt: 2 }}
                        >
                            {saving ? 'SE SALVEAZĂ...' : 'SALVEAZĂ PROFILUL'}
                        </Button>

                        <Button 
                            variant="text" 
                            fullWidth 
                            onClick={() => navigate('/dashboard')}
                            sx={{ mt: 1, color: '#718096', textTransform: 'none' }}
                        >
                            Înapoi la Dashboard
                        </Button>
                    </Box>
                </form>
            </Paper>
        </div>
    );
};

export default StudentProfilePage;