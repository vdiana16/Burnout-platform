import React from 'react';
import { Grid, Paper, Typography, Box, Button } from '@mui/material';

const PsychologistView = () => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={4}>
        <Paper className="stats-mini-card" elevation={0} sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Studenți Supravegheați</Typography>
          <Typography variant="h2" sx={{ my: 2, color: 'var(--primary-menta)', fontWeight: 'bold' }}>0</Typography>
          <Typography variant="body2" color="textSecondary">Înrolați în instituția ta</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper className="stats-mini-card" elevation={0}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Alerte Recente Burnout</Typography>
          <Box className="empty-stats" sx={{ py: 6 }}>
            <Typography variant="body2" color="textSecondary">Nu există alerte critice în acest moment.</Typography>
          </Box>
          <Button variant="outlined" sx={{ mt: 2, borderColor: 'var(--primary-menta)', color: 'var(--primary-menta)' }}>
            Generează Raport Lunar
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default PsychologistView;