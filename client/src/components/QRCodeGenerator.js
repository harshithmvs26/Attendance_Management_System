import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  QRCodeSVG,
  Refresh as RefreshIcon,
} from 'qrcode.react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { format } from 'date-fns';
import axios from 'axios';
import config from '../config';

const QRCodeGenerator = () => {
  const [subjects, setSubjects] = useState([]);
  const [activeQRCode, setActiveQRCode] = useState(null);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [newQRCode, setNewQRCode] = useState({
    subjectId: '',
    scheduledTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchSubjects();
    fetchActiveQRCode();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/classes/subjects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      showSnackbar('Error fetching subjects', 'error');
    }
  };

  const fetchActiveQRCode = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/classes/active`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setActiveQRCode(response.data);
    } catch (error) {
      console.error('Error fetching active QR code:', error);
      showSnackbar('Error fetching active QR code', 'error');
    }
  };

  const handleGenerateQRCode = async () => {
    if (!newQRCode.subjectId || !newQRCode.scheduledTime) {
      showSnackbar('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${config.apiUrl}/api/classes/create`, newQRCode, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setActiveQRCode(response.data);
      setQrCodeDialogOpen(false);
      setNewQRCode({ subjectId: '', scheduledTime: '' });
      showSnackbar('QR Code generated successfully', 'success');
    } catch (error) {
      console.error('Error generating QR code:', error);
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateQRCode = async () => {
    try {
      await axios.put(
        `${config.apiUrl}/api/classes/${activeQRCode.id}/deactivate`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setActiveQRCode(null);
      showSnackbar('QR Code deactivated successfully', 'success');
    } catch (error) {
      console.error('Error deactivating QR code:', error);
      showSnackbar('Error deactivating QR code', 'error');
    }
  };

  const handleCopyLink = () => {
    const qrCodeUrl = `${window.location.origin}/attendance/${activeQRCode.qr_code_data}`;
    navigator.clipboard.writeText(qrCodeUrl);
    showSnackbar('Link copied to clipboard', 'success');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        QR Code Generator
      </Typography>

      <Grid container spacing={3}>
        {/* Active QR Code Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Active QR Code
            </Typography>
            {activeQRCode ? (
              <Box sx={{ textAlign: 'center' }}>
                <QRCodeSVG
                  value={activeQRCode.qr_code_data}
                  size={256}
                  level="H"
                  includeMargin={true}
                  sx={{ mb: 2 }}
                />
                <Typography variant="subtitle1" gutterBottom>
                  {subjects.find(s => s.id === activeQRCode.subject_id)?.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Scheduled: {format(new Date(activeQRCode.scheduled_time), 'PPp')}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopyLink}
                    sx={{ mr: 1 }}
                  >
                    Copy Link
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDeactivateQRCode}
                  >
                    Deactivate
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary">
                  No active QR code. Generate one to start attendance.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setQrCodeDialogOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Generate QR Code
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Instructions Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Instructions
            </Typography>
            <Typography variant="body1" paragraph>
              1. Select a subject and scheduled time for the class session.
            </Typography>
            <Typography variant="body1" paragraph>
              2. Generate a QR code for the session.
            </Typography>
            <Typography variant="body1" paragraph>
              3. Display the QR code to students during the class.
            </Typography>
            <Typography variant="body1" paragraph>
              4. Students can scan the QR code to mark their attendance.
            </Typography>
            <Typography variant="body1" paragraph>
              5. Deactivate the QR code when the class ends.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Generate QR Code Dialog */}
      <Dialog open={qrCodeDialogOpen} onClose={() => setQrCodeDialogOpen(false)}>
        <DialogTitle>Generate New QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Subject</InputLabel>
              <Select
                value={newQRCode.subjectId}
                onChange={(e) =>
                  setNewQRCode({ ...newQRCode, subjectId: e.target.value })
                }
                label="Subject"
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name} - {subject.code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="datetime-local"
              label="Scheduled Time"
              value={newQRCode.scheduledTime}
              onChange={(e) =>
                setNewQRCode({ ...newQRCode, scheduledTime: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrCodeDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleGenerateQRCode}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default QRCodeGenerator; 