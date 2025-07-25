import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import AdminDashboard from './components/AdminDashboard';
import QRCodeGenerator from './components/QRCodeGenerator';
import AttendanceSubmission from './components/AttendanceSubmission';
import AttendanceRecords from './components/AttendanceRecords';
import PrivateRoute from './components/PrivateRoute';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/student"
            element={
              <PrivateRoute allowedRoles={['student']}>
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/faculty"
            element={
              <PrivateRoute allowedRoles={['faculty']}>
                <FacultyDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/faculty/qr"
            element={
              <PrivateRoute allowedRoles={['faculty']}>
                <QRCodeGenerator />
              </PrivateRoute>
            }
          />
          <Route
            path="/faculty/attendance"
            element={
              <PrivateRoute allowedRoles={['faculty']}>
                <AttendanceRecords />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AttendanceRecords />
              </PrivateRoute>
            }
          />
          <Route
            path="/attendance/:qrCodeData"
            element={<AttendanceSubmission />}
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
