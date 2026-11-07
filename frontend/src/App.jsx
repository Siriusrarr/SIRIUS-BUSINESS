import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import SetupPage from './pages/SetupPage.jsx';
import WorkspacePage from './pages/WorkspacePage.jsx';
import PlansPage from './pages/PlansPage.jsx';
import './styles.css';
import './space.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading"><span className="loading-spinner" /> Preparando tu espacio…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.selectedPlan) return <Navigate to="/plans" replace />;
  return children;
}

function PlanRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading"><span className="loading-spinner" /> Preparando tu espacio…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.selectedPlan ? <Navigate to="/" replace /> : children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading"><span className="loading-spinner" /> Preparando tu espacio…</div>;
  return user ? <Navigate to={user.selectedPlan ? '/' : '/plans'} replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>} />
      <Route path="/setup" element={<ProtectedRoute><SetupPage /></ProtectedRoute>} />
      <Route path="/plans" element={<PlanRoute><PlansPage /></PlanRoute>} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>;
}
