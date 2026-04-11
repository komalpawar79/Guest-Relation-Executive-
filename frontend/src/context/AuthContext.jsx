import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('AuthProvider: Mounting');

  useEffect(() => {
    const checkAuth = async () => {
      console.log('AuthProvider: Checking auth...');
      const token = localStorage.getItem('token');
      console.log('AuthProvider: Token exists?', !!token);
      
      if (token) {
        try {
          const response = await authAPI.getMe();
          console.log('AuthProvider: User fetched:', response.data.data);
          setUser(response.data.data);
        } catch (error) {
          console.log('AuthProvider: Error fetching user:', error.message);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      console.log('AuthProvider: Setting loading to false');
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    localStorage.setItem('token', response.data.data.token);
    setUser(response.data.data.user);
    return response.data;
  };

  const register = async (email, password, name, role) => {
    const response = await authAPI.register({ email, password, name, role });
    localStorage.setItem('token', response.data.data.token);
    setUser(response.data.data.user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
