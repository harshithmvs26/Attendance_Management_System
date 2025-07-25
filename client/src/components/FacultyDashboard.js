import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import { format } from 'date-fns';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import ClassStudents from './ClassStudents';
import { Person, Delete as DeleteIcon, School as SchoolIcon, QrCode as QrCodeIcon } from '@mui/icons-material';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [newClass, setNewClass] = useState({
    subjectId: '',
    sectionName: '',
    department: '',
    scheduledTime: '',
    duration: 60, // Default duration in minutes
    description: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/classes/list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/subjects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      showSnackbar('Error fetching subjects', 'error');
    }
  };

  const fetchAttendance = async (classId) => {
    try {
      console.log('Fetching attendance for classId:', classId);
      setSelectedClass(classId);
      setAttendanceDialogOpen(true);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleCreateClass = async () => {
    if (!newClass.subjectId || !newClass.scheduledTime || !newClass.sectionName || !newClass.department || !newClass.duration) {
      showSnackbar('Please fill in all fields', 'error');
      return;
    }

    try {
      await axios.post(`${config.apiUrl}/api/classes/create`, newClass, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCreateDialogOpen(false);
      setNewClass({ subjectId: '', scheduledTime: '', sectionName: '', department: '', duration: 60, description: '' });
      fetchClasses();
      showSnackbar('Class created successfully', 'success');
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error creating class', 'error');
    }
  };

  const handleUpdateAttendance = async (studentId, status) => {
    try {
      await axios.put(
        `${config.apiUrl}/api/classes/${selectedClass}/attendance/${studentId}`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchAttendance(selectedClass);
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const handleDeactivateClass = async (classId) => {
    try {
      await axios.put(
        `${config.apiUrl}/api/classes/${classId}/deactivate`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchClasses();
    } catch (error) {
      console.error('Error deactivating class:', error);
    }
  };

  const handleDeleteClass = async () => {
    try {
      await axios.delete(
        `${config.apiUrl}/api/classes/${selectedClass.id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setDeleteDialogOpen(false);
      setSelectedClass(null);
      fetchClasses();
      showSnackbar('Class deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting class:', error);
      showSnackbar(error.response?.data?.message || 'Error deleting class', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Faculty Dashboard</Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Person />}
            onClick={() => navigate('/faculty/profile')}
            sx={{ mr: 2 }}
          >
            Profile
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/faculty/qr')}
            sx={{ mr: 2 }}
          >
            Generate QR Code
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setCreateDialogOpen(true)}
          >
            Create New Class
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Class Management Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Class Management</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell>Section</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Class Code</TableCell>
                    <TableCell>Scheduled Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classes.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell>{cls.subject_name}</TableCell>
                      <TableCell>{cls.section_name}</TableCell>
                      <TableCell>{cls.department}</TableCell>
                      <TableCell>{cls.unique_code}</TableCell>
                      <TableCell>
                        {format(new Date(cls.scheduled_time), 'PPp')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={cls.is_active ? 'Active' : 'Inactive'}
                          color={cls.is_active ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => fetchAttendance(cls.id)}
                          sx={{ mr: 1 }}
                        >
                          View Attendance
                        </Button>
                        {cls.is_active && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDeactivateClass(cls.id)}
                            sx={{ mr: 1 }}
                          >
                            Deactivate
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<QrCodeIcon />}
                          onClick={() => navigate(`/faculty/qr?classId=${cls.id}`)}
                          sx={{ mr: 1 }}
                        >
                          Generate QR
                        </Button>
                        <IconButton
                          color="error"
                          onClick={() => {
                            setSelectedClass(cls);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Create Class Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Class</DialogTitle>
        <DialogContent>
          <TextField
            select
            autoFocus
            margin="dense"
            label="Subject"
            fullWidth
            value={newClass.subjectId}
            onChange={(e) => setNewClass({ ...newClass, subjectId: e.target.value })}
            required
            SelectProps={{
              native: true,
            }}
          >
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Section"
            fullWidth
            value={newClass.sectionName}
            onChange={(e) => setNewClass({ ...newClass, sectionName: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            label="Department"
            fullWidth
            value={newClass.department}
            onChange={(e) => setNewClass({ ...newClass, department: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            label="Scheduled Time"
            type="datetime-local"
            fullWidth
            value={newClass.scheduledTime}
            onChange={(e) => setNewClass({ ...newClass, scheduledTime: e.target.value })}
            required
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            label="Class Duration (minutes)"
            type="number"
            fullWidth
            value={newClass.duration}
            onChange={(e) => setNewClass({ ...newClass, duration: parseInt(e.target.value) })}
            required
            InputProps={{
              inputProps: { min: 15, max: 180 }
            }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newClass.description}
            onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
            placeholder="Enter class description (optional)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateClass} 
            variant="contained" 
            color="primary"
            disabled={!newClass.subjectId || !newClass.sectionName || !newClass.department || !newClass.scheduledTime || !newClass.duration}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog
        open={attendanceDialogOpen}
        onClose={() => setAttendanceDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Class Details and Attendance</DialogTitle>
        <DialogContent>
          {selectedClass && (
            <>
              {console.log('Rendering ClassStudents with classId:', selectedClass)}
              <ClassStudents classId={selectedClass.id} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttendanceDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Class</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the class "{selectedClass?.subject_name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteClass} variant="contained" color="error">
            Delete
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

export default FacultyDashboard; 