import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { QrCodeScanner, Person } from '@mui/icons-material';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [isScanning, setIsScanning] = useState(false);
  const qrScannerRef = useRef(null);

  const startScanner = () => {
    try {
      if (qrScannerRef.current) {
        stopScanner();
      }

      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support camera access. Please try a different browser like Chrome or Firefox.");
      }

      const qrScanner = new Html5Qrcode("qr-reader");
      qrScannerRef.current = qrScanner;

      qrScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false
        },
        (decodedText) => {
          console.log("QR Code detected:", decodedText);
          handleScan(decodedText);
          stopScanner();
          setScanDialogOpen(false);
        },
        (error) => {
          // Ignore errors during scanning
          console.log("QR scanning error:", error);
        }
      ).catch((err) => {
        console.error("Error starting scanner:", err);
        handleError(err);
        // Reset scanner state on error
        qrScannerRef.current = null;
        setIsScanning(false);
      });

      setIsScanning(true);
    } catch (error) {
      console.error("Error initializing scanner:", error);
      handleError(error);
      // Reset scanner state on error
      qrScannerRef.current = null;
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      try {
        // Check if scanner is running before trying to stop it
        if (qrScannerRef.current.isScanning) {
          qrScannerRef.current.stop().then(() => {
            console.log("Scanner stopped successfully");
            qrScannerRef.current = null;
            setIsScanning(false);
          }).catch((err) => {
            console.error("Error stopping scanner:", err);
            // Even if there's an error stopping, reset the state
            qrScannerRef.current = null;
            setIsScanning(false);
          });
        } else {
          // If scanner is not running, just reset the state
          console.log("Scanner was not running, resetting state");
          qrScannerRef.current = null;
          setIsScanning(false);
        }
      } catch (error) {
        console.error("Error in stopScanner:", error);
        // Reset state even if there's an error
        qrScannerRef.current = null;
        setIsScanning(false);
      }
    } else {
      // No scanner reference, just reset the state
      setIsScanning(false);
    }
  };

  const handleScan = async (data) => {
    if (data) {
      console.log("Processing QR code data:", data);
      setScanResult(data);
      try {
        const response = await axios.post(`${config.apiUrl}/api/attendance/mark`, {
          qrCodeData: data
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        console.log("Attendance marked successfully:", response.data);
        setSnackbar({
          open: true,
          message: 'Attendance marked successfully!',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error marking attendance:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error marking attendance',
          severity: 'error'
        });
      }
    }
  };

  const handleError = (error) => {
    console.error("Camera error:", error);
    
    let errorMessage = "Error accessing camera";
    
    if (error.message && error.message.includes("Permission")) {
      errorMessage = "Camera permission denied. Please allow camera access in your browser settings.";
    } else if (error.message && error.message.includes("not found")) {
      errorMessage = "No camera found on your device.";
    } else if (error.message && error.message.includes("support")) {
      errorMessage = error.message;
    } else if (error.message && error.message.includes("HTTPS")) {
      errorMessage = "Camera access requires HTTPS. Please use a secure connection.";
    }
    
    setSnackbar({
      open: true,
      message: errorMessage,
      severity: 'error'
    });
    
    // Close the dialog after showing the error
    setTimeout(() => {
      setScanDialogOpen(false);
    }, 3000);
  };

  useEffect(() => {
    if (scanDialogOpen && !isScanning) {
      // Wait for the dialog to be fully rendered
      const timer = setTimeout(() => {
        startScanner();
      }, 500);
      
      return () => {
        clearTimeout(timer);
      };
    }
    
    return () => {
      // Only try to stop the scanner if it's actually running
      if (isScanning) {
        stopScanner();
      }
    };
  }, [scanDialogOpen]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* QR Code Scanner Section - Now at the top */}
      <Paper sx={{ p: 4, mb: 4, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
        <Typography variant="h5" gutterBottom>
          Mark Attendance with QR Code
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Scan the QR code displayed by your faculty to mark your attendance for the current class session
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          startIcon={<QrCodeScanner />}
          onClick={() => setScanDialogOpen(true)}
          sx={{ 
            bgcolor: 'white', 
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'grey.100'
            }
          }}
        >
          Scan QR Code for Attendance
        </Button>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Student Dashboard</Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Person />}
            onClick={() => navigate('/student/profile')}
          >
            Profile
          </Button>
        </Box>
      </Box>

      {/* QR Code Scanner Dialog */}
      <Dialog 
        open={scanDialogOpen} 
        onClose={() => {
          stopScanner();
          setScanDialogOpen(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Mark Attendance with QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ width: '100%', maxWidth: 400, margin: 'auto', minHeight: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            {!isScanning && <CircularProgress sx={{ mb: 2 }} />}
            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
              Position the QR code within the frame to mark your attendance
            </Typography>
            <Typography variant="caption" sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}>
              If you're having trouble, make sure you've granted camera permissions to this website.
            </Typography>
            <div id="qr-reader" style={{ width: '100%', maxWidth: '300px' }}></div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            stopScanner();
            setScanDialogOpen(false);
          }}>
            Close
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StudentDashboard; 