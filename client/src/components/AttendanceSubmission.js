import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AttendanceSubmission = () => {
  const { qrCodeData } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [classDetails, setClassDetails] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    location: '',
    remarks: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (qrCodeData) {
      fetchClassDetails();
    }
  }, [qrCodeData]);

  const fetchClassDetails = async () => {
    try {
      const response = await axios.get(`/api/attendance/class/${qrCodeData}`);
      setClassDetails(response.data);
    } catch (error) {
      showSnackbar('Invalid or expired QR code', 'error');
      setTimeout(() => navigate('/student'), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/attendance/submit', {
        classId: classDetails.id,
        ...formData
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      showSnackbar('Attendance submitted successfully', 'success');
      setTimeout(() => navigate('/student'), 2000);
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error submitting attendance', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  if (!classDetails) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Attendance Submission
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          Subject: {classDetails.subject_name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Scheduled: {new Date(classDetails.scheduled_time).toLocaleString()}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Student ID"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks (Optional)"
                multiline
                rows={3}
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Attendance'}
              </Button>
            </Grid>
          </Grid>
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AttendanceSubmission; 