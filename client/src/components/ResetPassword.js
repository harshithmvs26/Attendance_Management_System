import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import config from '../config';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.password !== passwords.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Passwords do not match',
        severity: 'error'
      });
      return;
    }

    try {
      await axios.post(`${config.apiUrl}/api/auth/reset-password`, {
        token,
        password: passwords.password
      });
      setSnackbar({
        open: true,
        message: 'Password reset successful! Redirecting to login...',
        severity: 'success'
      });
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error resetting password',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <SchoolIcon sx={{ fontSize: 60, color: 'primary.main' }} />
          </Box>
          <Typography variant="h4" align="center" gutterBottom>
            Reset Password
          </Typography>
          <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 3 }}>
            Please enter your new password.
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={passwords.password}
              onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
            >
              Reset Password
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ResetPassword; 