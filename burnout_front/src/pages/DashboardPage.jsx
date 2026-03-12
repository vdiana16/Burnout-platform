import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { Container, Typography, Box } from '@mui/material';
import StudentView from './StudentView';
import PsychologistView from './PsychologistView';
import '../styles/Dashboard.css';

const DashboardPage = () => {
  const { user } = useAuth(); // Extragem datele utilizatorului

  return (
    <Container maxWidth="lg" className="dashboard-container">
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h4" className="dashboard-title">
          Bună, {user?.first_name || 'utilizator'}! 👋
        </Typography>
        <Typography variant="body1" className="dashboard-subtitle">
          Panou de control: <strong>{user?.role === 'PSYCHOLOGIST' ? 'Psiholog' : 'Student'}</strong> la {user?.institution_name || 'Instituția ta'}.
        </Typography>
      </Box>

      {/* Randare condiționată în funcție de rol */}
      {user?.role === 'PSYCHOLOGIST' ? (
        <PsychologistView user={user} />
      ) : (
        <StudentView user={user} />
      )}
    </Container>
  );
};

export default DashboardPage;