import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CourseBuilder from './components/CourseBuilder';
import CourseList from './components/CourseList';
import UserManagement from './components/UserManagement';
import Login from './components/Login';
import { ToastProvider, useToast } from './components/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserRole } from './types';

// Security Enforcer Component
const ProtectedRoute = ({ allowedRoles }: { allowedRoles: UserRole[] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const { addToast } = useToast();
  const [redirect, setRedirect] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (loading) return; // Wait while profile is being fetched

    if (!isAuthenticated) {
      setRedirect('/login');
    } else if (user && !allowedRoles.includes(user.role)) {
      addToast(`Access Denied: ${user.role}s cannot access this resource.`, 'error');
      setRedirect('/');
    }
  }, [isAuthenticated, user, allowedRoles, loading]);

  if (loading) return null; // Or a loading spinner

  if (redirect) {
    return <Navigate to={redirect} replace />;
  }

  // Prevent flash of content if checking auth
  if (!user) return null;

  return <Outlet />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Layout */}
            <Route element={
              <Layout>
                <Outlet />
              </Layout>
            }>
              {/* GLOBAL DASHBOARD - Accessible by All Authenticated Users */}
              <Route element={<ProtectedRoute allowedRoles={['Admin', 'Teacher', 'Student']} />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/courses" element={<CourseList />} />
              </Route>

              {/* TEACHER & ADMIN ZONES */}
              <Route element={<ProtectedRoute allowedRoles={['Admin', 'Teacher']} />}>
                <Route path="/create" element={<CourseBuilder />} />
                <Route path="/analytics" element={<div className="p-10 text-center text-gray-500">Advanced Analytics</div>} />
              </Route>

              {/* ADMIN ONLY ZONES */}
              <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="/users" element={<UserManagement />} />
                <Route path="/settings" element={<div className="p-10 text-center text-gray-500">System Settings (Admin Only)</div>} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;