import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Disbursements from './pages/Disbursements';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Logs from './pages/Logs';
import Capital from './pages/Capital';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
      <Route path="/disbursements" element={<ProtectedRoute><Disbursements /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute adminOnly><Settings /></ProtectedRoute>} />
      <Route path="/logs" element={<ProtectedRoute adminOnly><Logs /></ProtectedRoute>} />
      <Route path="/capital" element={<ProtectedRoute><Capital /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

const isMobile = () => window.innerWidth < 640;

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <HashRouter>
        <AppRoutes />
        <Toaster
          position={isMobile() ? 'top-center' : 'top-right'}
          toastOptions={{
            style: { fontFamily: 'Sarabun, sans-serif', fontSize: '14px' },
            success: { duration: 3000 },
            error: { duration: 5000 },
          }}
          containerStyle={isMobile() ? { top: 16 } : { top: 16, right: 16 }}
        />
      </HashRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
