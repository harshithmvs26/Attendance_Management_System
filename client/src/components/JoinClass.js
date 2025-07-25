import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config';

const JoinClass = () => {
  const navigate = useNavigate();
  const [classCode, setClassCode] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleJoinClass = async () => {
    if (!classCode) {
      showSnackbar('Please enter a class code', 'error');
      return;
    }

    try {
      const response = await axios.post(
        `${config.apiUrl}/api/classes/join`,
        { uniqueCode: classCode },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      setClassCode('');
      showSnackbar('Successfully joined the class!', 'success');
      
      // Redirect to student dashboard after a short delay
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1500);
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error joining class', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Join a Class
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Enter the unique class code provided by your faculty to join a class.
        </Typography>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <TextField
            fullWidth
            label="Class Code"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleJoinClass}
            size="large"
          >
            Join Class
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default JoinClass; 