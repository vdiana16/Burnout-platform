import React from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Container } from '@mui/material';
import '../styles/ProtectedView.css';

const ProtectedLayout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box className="protected-wrapper">
      <AppBar position="fixed" className="app-bar" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar className="toolbar" sx={{ px: '0 !important' }}>
            <Typography 
              variant="h6" 
              className="app-title" 
              onClick={() => navigate('/dashboard')}
              style={{ cursor: 'pointer' }}
            >
              BurnoutApp
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 3 } }}>
              <Button color="inherit" className="nav-link" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button color="inherit" className="nav-link" onClick={() => navigate('/quiz')}>
                Quiz
              </Button>
              <Button 
                variant="outlined" 
                className="logout-btn"
                onClick={logout}
              >
                Logout
              </Button>
              <Avatar className="user-avatar">
                {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
              </Avatar>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Aici se "injectează" Dashboard-ul sau alte pagini */}
      <Box component="main" className="main-content">
        <Outlet />
      </Box>
    </Box>
  );
};

export default ProtectedLayout;