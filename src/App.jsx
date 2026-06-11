import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import UpdateStatus from './pages/UpdateStatus';
import UpdateProgress from './pages/UpdateProgress';
import UploadProof from './pages/UploadProof';
import ReportIssue from './pages/ReportIssue';
import { getAuthToken } from './utils/api';
import { initNotifications, listenForMessages } from './utils/firebase';

// Protected Route wrapper component
function ProtectedRoute({ children }) {
  const token = getAuthToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      initNotifications();
      listenForMessages();
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Pages */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/installation/leads"
          element={
            <ProtectedRoute>
              <Leads />
            </ProtectedRoute>
          }
        />
        <Route path="/leads" element={<Navigate to="/installation/leads" replace />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/update-status"
          element={
            <ProtectedRoute>
              <UpdateStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/update-progress"
          element={
            <ProtectedRoute>
              <UpdateProgress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-proof"
          element={
            <ProtectedRoute>
              <UploadProof />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report-issue"
          element={
            <ProtectedRoute>
              <ReportIssue />
            </ProtectedRoute>
          }
        />

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
