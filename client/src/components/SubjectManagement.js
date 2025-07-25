import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
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
  Alert,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [subjectData, setSubjectData] = useState({ name: '', code: '', description: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      showSnackbar('Error fetching subjects', 'error');
      setLoading(false);
    }
  };

  const handleOpen = (subject = null) => {
    if (subject) {
      setEditSubject(subject);
      setSubjectData({ name: subject.name, code: subject.code, description: subject.description });
    } else {
      setEditSubject(null);
      setSubjectData({ name: '', code: '', description: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditSubject(null);
    setSubjectData({ name: '', code: '', description: '' });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (editSubject) {
        await axios.put(`http://localhost:5000/api/subjects/${editSubject.id}`, subjectData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showSnackbar('Subject updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/subjects', subjectData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showSnackbar('Subject created successfully');
      }
      handleClose();
      fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      showSnackbar(error.response?.data?.message || 'Error saving subject', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/subjects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showSnackbar('Subject deleted successfully');
        fetchSubjects();
      } catch (error) {
        console.error('Error deleting subject:', error);
        showSnackbar('Error deleting subject', 'error');
      }
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading subjects...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Subject Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ mb: 2 }}
        >
          Add Subject
        </Button>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell>{subject.code}</TableCell>
                  <TableCell>{subject.name}</TableCell>
                  <TableCell>{subject.description}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(subject)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(subject.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editSubject ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Subject Code"
            fullWidth
            value={subjectData.code}
            onChange={(e) => setSubjectData({ ...subjectData, code: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Subject Name"
            fullWidth
            value={subjectData.name}
            onChange={(e) => setSubjectData({ ...subjectData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={subjectData.description}
            onChange={(e) => setSubjectData({ ...subjectData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editSubject ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SubjectManagement; 