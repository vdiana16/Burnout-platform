import React from 'react';
import { Grid, Paper, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const StudentView = () => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={8}>
        <Paper className="quiz-banner" elevation={0}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              Ești gata pentru o nouă evaluare?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Testul te ajută să monitorizezi nivelul tău de stres și burnout.
            </Typography>
            <Button 
              variant="contained" 
              className="btn-start" 
              onClick={() => navigate('/quiz')}
            >
              Începe Chestionarul
            </Button>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper className="stats-mini-card" elevation={0}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Istoric Personal</Typography>
          <Box className="empty-stats">
            <Typography variant="body2" color="textSecondary">Încă nu ai evaluări finalizate.</Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default StudentView;