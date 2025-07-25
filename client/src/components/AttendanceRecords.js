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
  IconButton,
  Snackbar,
  Alert,
  Grid,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { format } from 'date-fns';
import config from '../config';

const AttendanceRecords = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    subjectId: '',
    studentId: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchAttendanceRecords();
    fetchSubjects();
    fetchStudents();
  }, [filters]);

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', format(filters.startDate, 'yyyy-MM-dd'));
      if (filters.endDate) params.append('endDate', format(filters.endDate, 'yyyy-MM-dd'));
      if (filters.subjectId) params.append('subjectId', filters.subjectId);
      if (filters.studentId) params.append('studentId', filters.studentId);

      const response = await axios.get(`${config.apiUrl}/api/attendance/records?${params.toString()}`);
      setAttendanceRecords(response.data);
    } catch (error) {
      showSnackbar('Error fetching attendance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/attendance/subjects`);
      setSubjects(response.data);
    } catch (error) {
      showSnackbar('Error fetching subjects', 'error');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/attendance/students`);
      setStudents(response.data);
    } catch (error) {
      showSnackbar('Error fetching students', 'error');
    }
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setOpenDialog(true);
  };

  const handleDelete = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await axios.delete(`/api/attendance/records/${recordId}`);
        showSnackbar('Attendance record deleted successfully', 'success');
        fetchAttendanceRecords();
      } catch (error) {
        showSnackbar('Error deleting attendance record', 'error');
      }
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/attendance/records/${selectedRecord.id}`, selectedRecord);
      showSnackbar('Attendance record updated successfully', 'success');
      setOpenDialog(false);
      fetchAttendanceRecords();
    } catch (error) {
      showSnackbar('Error updating attendance record', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/attendance/export', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_records.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showSnackbar('Error exporting attendance records', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Attendance Records</Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export to CSV
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => setFilters({ ...filters, startDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => setFilters({ ...filters, endDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                value={filters.subjectId}
                onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}
                label="Subject"
              >
                <MenuItem value="">All Subjects</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Student</InputLabel>
              <Select
                value={filters.studentId}
                onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}
                label="Student"
              >
                <MenuItem value="">All Students</MenuItem>
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : attendanceRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              attendanceRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{format(new Date(record.timestamp), 'PPpp')}</TableCell>
                  <TableCell>{record.student_name}</TableCell>
                  <TableCell>{record.subject_name}</TableCell>
                  <TableCell>{record.status}</TableCell>
                  <TableCell>{record.location}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(record)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(record.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Edit Attendance Record</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedRecord?.status || ''}
              onChange={(e) => setSelectedRecord({ ...selectedRecord, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="present">Present</MenuItem>
              <MenuItem value="absent">Absent</MenuItem>
              <MenuItem value="late">Late</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Location"
            value={selectedRecord?.location || ''}
            onChange={(e) => setSelectedRecord({ ...selectedRecord, location: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Remarks"
            multiline
            rows={3}
            value={selectedRecord?.remarks || ''}
            onChange={(e) => setSelectedRecord({ ...selectedRecord, remarks: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">
            Update
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

export default AttendanceRecords; 