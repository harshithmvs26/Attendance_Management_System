import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
  Grid,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import config from '../config';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });
  const [editing, setEditing] = useState({
    name: false,
    email: false,
    phone: false
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [verifyDialog, setVerifyDialog] = useState({
    open: false,
    password: '',
    field: null,
    newValue: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      showSnackbar('Error fetching profile', 'error');
      setLoading(false);
    }
  };

  const handleEdit = (field) => {
    setEditing({
      ...editing,
      [field]: true
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email' || name === 'name' || name === 'phone') {
      setVerifyDialog({
        open: true,
        password: '',
        field: name,
        newValue: value
      });
    }
  };

  const handleVerifySubmit = async () => {
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/users/verify-password`,
        { password: verifyDialog.password },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.verified) {
        setProfile({
          ...profile,
          [verifyDialog.field]: verifyDialog.newValue
        });
        setEditing({
          ...editing,
          [verifyDialog.field]: false
        });
        setVerifyDialog({
          open: false,
          password: '',
          field: null,
          newValue: ''
        });
        showSnackbar('Verification successful', 'success');
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      showSnackbar(error.response?.data?.message || 'Invalid password', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${config.apiUrl}/api/users/profile`,
        profile,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      showSnackbar('Profile updated successfully', 'success');
      setEditing({
        name: false,
        email: false,
        phone: false
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar(error.response?.data?.message || 'Error updating profile', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main' }}
          >
            {profile.name.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h5" gutterBottom>
            {profile.role === 'faculty' ? 'Faculty Profile' : 'Student Profile'}
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={!editing.name}
                  required
                />
                <IconButton 
                  onClick={() => handleEdit('name')}
                  color="primary"
                  disabled={editing.name}
                >
                  <EditIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled={!editing.email}
                  required
                />
                <IconButton 
                  onClick={() => handleEdit('email')}
                  color="primary"
                  disabled={editing.email}
                >
                  <EditIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleChange}
                  disabled={!editing.phone}
                  placeholder="Enter your phone number"
                />
                <IconButton 
                  onClick={() => handleEdit('phone')}
                  color="primary"
                  disabled={editing.phone}
                >
                  <EditIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={!Object.values(editing).some(value => value)}
                >
                  Update Profile
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Password Verification Dialog */}
      <Dialog open={verifyDialog.open} onClose={() => setVerifyDialog({ ...verifyDialog, open: false })}>
        <DialogTitle>Verify Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please enter your password to confirm this change
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={verifyDialog.password}
            onChange={(e) => setVerifyDialog({ ...verifyDialog, password: e.target.value })}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialog({ ...verifyDialog, open: false })}>Cancel</Button>
          <Button onClick={handleVerifySubmit} variant="contained" color="primary">
            Verify
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile; 