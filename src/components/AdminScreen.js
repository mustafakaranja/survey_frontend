import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import { 
  LogoutOutlined,
  AdminPanelSettingsOutlined
} from '@mui/icons-material';
import AdminPanel from './AdminPanel';

const AdminScreen = ({ user, onLogout }) => {
  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ 
          background: 'linear-gradient(195deg, #42424a, #191919)',
          borderRadius: '0.75rem',
          margin: '1rem',
          padding: '0.875rem 1.5rem !important'
        }}>
          <AdminPanelSettingsOutlined sx={{ mr: 2, color: 'white' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white', fontWeight: 600 }}>
            Admin Dashboard - {user?.username}
          </Typography>
          <IconButton 
            color="inherit" 
            onClick={onLogout}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <LogoutOutlined />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 2 }}>
        <AdminPanel />
      </Box>
    </>
  );
};

export default AdminScreen;
