import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Link
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import config from '../config';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [openRegister, setOpenRegister] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${config.apiUrl}/api/auth/login`, formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      
      switch (response.data.role) {
        case 'student':
          navigate('/student');
          break;
        case 'faculty':
          navigate('/faculty');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Login failed',
        severity: 'error'
      });
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${config.apiUrl}/api/auth/register`, registerData);
      setSnackbar({
        open: true,
        message: 'Registration successful! Please login.',
        severity: 'success'
      });
      setOpenRegister(false);
      setRegisterData({
        name: '',
        email: '',
        password: '',
        role: 'student'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Registration failed',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <SchoolIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            </Box>
            <Typography variant="h4" align="center" gutterBottom>
              Attendance Management System
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
              Login to your account
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                margin="normal"
                required
              />
              <Box sx={{ mt: 1, textAlign: 'right' }}>
                <Link component={RouterLink} to="/forgot-password" variant="body2">
                  Forgot Password?
                </Link>
              </Box>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 3 }}
              >
                Login
              </Button>
            </Box>
            <Divider sx={{ my: 3 }}>OR</Divider>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={() => setOpenRegister(true)}
            >
              Register as Student/Faculty
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Registration Dialog */}
      <Dialog open={openRegister} onClose={() => setOpenRegister(false)}>
        <DialogTitle>Register New Account</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={registerData.name}
            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={registerData.email}
            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={registerData.password}
            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={registerData.role}
              onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
              label="Role"
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="faculty">Faculty</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRegister(false)}>Cancel</Button>
          <Button onClick={handleRegister} variant="contained">
            Register
          </Button>
        </DialogActions>
      </Dialog>

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

export default Login;
