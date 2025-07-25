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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';
import config from '../config';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    totalSubjects: 0,
    totalPresent: 0,
    totalAbsent: 0
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    subjectId: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchSubjects();
    fetchStatistics();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/admin/subjects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/admin/statistics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      await axios.post(`${config.apiUrl}/api/admin/users`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSnackbar({
        open: true,
        message: 'User created successfully',
        severity: 'success'
      });
      setOpenDialog(false);
      fetchUsers();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error creating user',
        severity: 'error'
      });
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      await axios.put(`${config.apiUrl}/api/admin/users/${userId}`, userData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOpenDialog(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success'
        });
        fetchUsers();
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error deleting user',
          severity: 'error'
        });
      }
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await axios.get('/api/admin/report', {
        params: reportFilters,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h4">
                {statistics.totalStudents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Subjects
              </Typography>
              <Typography variant="h4">
                {statistics.totalSubjects}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Present Today
              </Typography>
              <Typography variant="h4">
                {statistics.totalPresent}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Absent Today
              </Typography>
              <Typography variant="h4">
                {statistics.totalAbsent}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* User Management Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">User Management</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setDialogType('create');
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'student'
                  });
                  setOpenDialog(true);
                }}
              >
                Add User
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={
                            user.role === 'admin'
                              ? 'error'
                              : user.role === 'faculty'
                              ? 'primary'
                              : 'success'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), 'PPp')}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => {
                              setSelectedUser(user);
                              setFormData({
                                name: user.name,
                                email: user.email,
                                role: user.role
                              });
                              setDialogType('edit');
                              setOpenDialog(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Report Generation Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Generate Report</Typography>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => setReportDialogOpen(true)}
              >
                Generate Report
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Create/Edit User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {dialogType === 'create' ? 'Create User' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
          />
          {dialogType === 'create' && (
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
            />
          )}
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              label="Role"
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="faculty">Faculty</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">
            {dialogType === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)}>
        <DialogTitle>Generate Attendance Report</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={reportFilters.startDate}
              onChange={(e) =>
                setReportFilters({ ...reportFilters, startDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={reportFilters.endDate}
              onChange={(e) =>
                setReportFilters({ ...reportFilters, endDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                value={reportFilters.subjectId}
                onChange={(e) =>
                  setReportFilters({ ...reportFilters, subjectId: e.target.value })
                }
                label="Subject"
              >
                <MenuItem value="">All Subjects</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name} - {subject.code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerateReport}>
            Generate
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

export default AdminDashboard; 