import React, { useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Container, Menu, MenuItem, IconButton, Tooltip } from '@mui/material';
import '../styles/ProtectedLayout.css';

const ProtectedLayout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Box className="protected-wrapper">
      <AppBar position="fixed" className="app-bar" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {/* Logo înlocuit cu Emoji 🌿 pentru a evita erorile de import */}
            <Box 
              sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: 'pointer' }} 
              onClick={() => navigate('/dashboard')}
            >
              <span style={{ fontSize: '24px', marginRight: '8px' }}>🌿</span>
              <Typography variant="h6" className="app-title-text">
                Student Wellbeing
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button className="nav-menu-btn" onClick={() => navigate('/dashboard')}>Dashboard</Button>
              {user?.role === 'STUDENT' && (
                <Button className="nav-menu-btn" onClick={() => navigate('/quiz')}>Evaluare</Button>
              )}
              
              <Tooltip title="Setări cont">
                <IconButton onClick={handleMenuClick} sx={{ ml: 2, p: 0.5, border: '2px solid #2E8B57' }}>
                  <Avatar className="nav-avatar" sx={{ bgcolor: '#2E8B57', width: 32, height: 32, fontSize: '0.9rem' }}>
                    {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                PaperProps={{ className: 'nav-dropdown-menu' }}
              >
                <MenuItem onClick={() => { 
                  navigate(user?.role === 'PSYCHOLOGIST' ? '/psychologist-profile' : '/student-profile'); 
                  handleMenuClose(); 
                }}>
                  <span style={{ marginRight: '10px' }}>👤</span> Profilul Meu
                </MenuItem>
                <MenuItem onClick={() => { logout(); handleMenuClose(); }} sx={{ color: '#e53e3e' }}>
                  <span style={{ marginRight: '10px' }}>🚪</span> Deconectare
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar /> 
      <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default ProtectedLayout;