import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/User/Dashboard';
import Groups from './pages/User/Groups';
import Invite from './pages/User/Invite';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Settings from './pages/User/Settings';
import VerifyUsers from './pages/Admin/VerifyUsers';
import GroupsRepair from './pages/Admin/GroupsRepair';
import Users from './pages/Admin/Users';
import JoinGroup from './pages/User/JoinGroup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}> = ({ children, requireAuth = true, requireAdmin = false }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user && requireAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin, redirect to /admin unless already on an admin route
  if (user?.role === 'admin' && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }

  if (requireAdmin && (!user || user.role !== 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  if (user && !requireAuth && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Add JoinRedirect component for /join route
const JoinRedirect: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      navigate(`/register?code=${encodeURIComponent(code)}`, { replace: true });
    } else {
      navigate('/register', { replace: true });
    }
  }, [navigate, searchParams]);
  return null;
};

function App() {
  const { initialize, initialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <ProtectedRoute requireAuth={false}>
          <Landing />
        </ProtectedRoute>
      } />
      <Route path="/login" element={
        <ProtectedRoute requireAuth={false}>
          <Login />
        </ProtectedRoute>
      } />
      <Route path="/register" element={
        <ProtectedRoute requireAuth={false}>
          <Register />
        </ProtectedRoute>
      } />
      <Route path="/join" element={<JoinRedirect />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected User Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/groups" element={
        <ProtectedRoute>
          <Groups />
        </ProtectedRoute>
      } />
      <Route path="/invite" element={
        <ProtectedRoute>
          <Invite />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/join-group" element={
        <ProtectedRoute>
          <JoinGroup />
        </ProtectedRoute>
      } />

      {/* Protected Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/verify" element={
        <ProtectedRoute requireAdmin>
          <VerifyUsers />
        </ProtectedRoute>
      } />
      <Route path="/admin/groups-repair" element={
        <ProtectedRoute requireAdmin>
          <GroupsRepair />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute requireAdmin>
          <Users />
        </ProtectedRoute>
      } />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;