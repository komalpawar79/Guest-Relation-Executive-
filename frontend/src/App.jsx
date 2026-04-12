import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { Dashboard } from './pages/Dashboard';
import './index.css';
import { Component, useEffect } from 'react';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-textSecondary">Loading...</p>
      </div>
    </div>
  );
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ERROR CAUGHT:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'monospace', textAlign: 'left', backgroundColor: '#fff', color: '#000', minHeight: '100vh' }}>
          <h1 style={{ color: 'red' }}>❌ REACT ERROR</h1>
          <h2>Error Message:</h2>
          <pre style={{ backgroundColor: '#ffe0e0', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
            {this.state.error?.message}
          </pre>
          <h2>Stack Trace:</h2>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px', overflow: 'auto', maxHeight: '400px' }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return (
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<RootRedirect />} />
          </Routes>
        </AuthProvider>
      </Router>
    );
  }
}

export default ErrorBoundary;
