import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';

const ClassManagement = ({ classId }) => {
  const [students, setStudents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/faculty/class/${classId}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      await axios.post(`http://localhost:5000/api/faculty/class/${classId}/attendance`, attendanceData);
      setSnackbar({
        open: true,
        message: 'Attendance marked successfully',
        severity: 'success'
      });
      setOpenDialog(false);
      fetchStudents();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error marking attendance',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Class Management
        </Typography>
        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          sx={{ mb: 2 }}
        >
          Mark Attendance
        </Button>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.status || 'Not marked'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Mark Attendance</DialogTitle>
        <DialogContent>
          {students.map((student) => (
            <Box key={student.id} sx={{ mt: 2 }}>
              <Typography>{student.name}</Typography>
              <TextField
                select
                fullWidth
                value={attendanceData[student.id] || ''}
                onChange={(e) => setAttendanceData({
                  ...attendanceData,
                  [student.id]: e.target.value
                })}
              >
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
              </TextField>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleMarkAttendance} variant="contained">
            Save
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

export default ClassManagement;
