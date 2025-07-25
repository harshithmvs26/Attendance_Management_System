import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { format } from 'date-fns';
import axios from 'axios';
import config from '../config';

const ClassStudents = ({ classId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classData, setClassData] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    console.log('ClassStudents component mounted with classId:', classId);
    fetchClassStudents();
  }, [classId]);

  const fetchClassStudents = async () => {
    try {
      console.log('Fetching class students for classId:', classId);
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token found');
      
      const response = await axios.get(
        `${config.apiUrl}/api/classes/${classId}/students`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('API response:', response.data);
      setClassData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching class students:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Error fetching class students');
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error fetching class students',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          Class Details
        </Typography>
        {classData?.classInfo && (
          <Box sx={{ mb: 3 }}>
            <Typography><strong>Subject:</strong> {classData.classInfo.subjectName}</Typography>
            <Typography><strong>Section:</strong> {classData.classInfo.sectionName}</Typography>
            <Typography><strong>Department:</strong> {classData.classInfo.department}</Typography>
            <Typography><strong>Scheduled Time:</strong> {format(new Date(classData.classInfo.scheduledTime), 'PPp')}</Typography>
            <Typography><strong>Status:</strong> {classData.classInfo.isActive ? 'Active' : 'Inactive'}</Typography>
          </Box>
        )}

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Students who Joined
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Attendance Time</TableCell>
                <TableCell>Total Attendance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classData?.students?.map((student) => (
                <TableRow key={`${student.id}-${student.attendance_time}`}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.status || 'Not marked'}</TableCell>
                  <TableCell>
                    {student.attendance_time 
                      ? format(new Date(student.attendance_time), 'PPp')
                      : 'Not marked'}
                  </TableCell>
                  <TableCell>{student.attendance_count}</TableCell>
                </TableRow>
              ))}
              {(!classData?.students || classData.students.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No students have joined this class yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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

export default ClassStudents; 