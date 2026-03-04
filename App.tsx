import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CourseBuilder from './components/CourseBuilder';
import CourseList from './components/CourseList';
import UserManagement from './components/UserManagement';
import Login from './components/Login';
import Signup from './components/Signup';
import QuizPlayer from './components/QuizPlayer';
import QuizManagement from './components/QuizManagement';
import CertificateVerification from './components/CertificateVerification';
import { ToastProvider, useToast } from './components/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserRole } from './types';

const QuizPlayerWrapper: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const courseId = new URLSearchParams(window.location.search).get('courseId') || '';
  if (!quizId) return <Navigate to="/" replace />;
  return <QuizPlayer quizId={quizId} courseId={courseId} />;
};

const QuizManagementWrapper: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  if (!courseId) return <Navigate to="/" replace />;
  return <QuizManagement courseId={courseId} courseTitle="Course" courseDescription="" />;
};

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
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

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
                <Route path="/quiz-management/:courseId" element={<QuizManagementWrapper />} />
              </Route>

              {/* PUBLIC ROUTES */}
              <Route path="/verify/:code" element={<CertificateVerification />} />
              <Route path="/quiz/:quizId" element={<QuizPlayerWrapper />} />

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