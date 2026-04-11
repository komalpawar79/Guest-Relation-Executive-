import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { Dashboard } from './pages/Dashboard';
import './index.css';
import { Component } from 'react';

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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    );
  }
}

export default ErrorBoundary;
