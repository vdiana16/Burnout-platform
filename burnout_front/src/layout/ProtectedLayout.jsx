import React, { useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Container, Menu, MenuItem, IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import '../styles/ProtectedView.css';

const ProtectedLayout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Stare pentru meniul de profil
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Box className="protected-wrapper">
      <AppBar position="fixed" className="app-bar" elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', color: '#2d3748' }}>
        <Container maxWidth="lg">
          <Toolbar className="toolbar" sx={{ px: '0 !important', justifyContent: 'space-between' }}>
            <Typography 
              variant="h6" 
              className="app-title" 
              onClick={() => navigate('/dashboard')}
              style={{ cursor: 'pointer', fontWeight: 'bold', color: '#2E8B57' }}
            >
              BurnoutApp
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button color="inherit" onClick={() => navigate('/dashboard')} sx={{ textTransform: 'none', fontWeight: 500 }}>
                Dashboard
              </Button>

              {/* Avatar cu Meniu Dropdown */}
              <Tooltip title="Setări cont">
                <IconButton onClick={handleMenuClick} sx={{ p: 0, border: '2px solid #2E8B57' }}>
                  <Avatar sx={{ bgcolor: '#2E8B57', width: 35, height: 35, fontSize: '0.9rem' }}>
                    {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{ sx: { mt: 1.5, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: '12px', minWidth: '180px' } }}
              >
                <MenuItem onClick={() => { navigate('/student-profile'); handleMenuClose(); }}>
                  <AccountCircleIcon sx={{ mr: 1, color: '#4a5568' }} /> Profilul Meu
                </MenuItem>
                <MenuItem onClick={() => { logout(); handleMenuClose(); }} sx={{ color: '#e53e3e' }}>
                  <LogoutIcon sx={{ mr: 1 }} /> Deconectare
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" className="main-content" sx={{ pt: '80px' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default ProtectedLayout;