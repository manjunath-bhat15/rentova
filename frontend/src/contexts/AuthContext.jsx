import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('rentova_token');
    const savedUser = localStorage.getItem('rentova_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Verify token is still valid
      api.get('/api/auth/me')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('rentova_user', JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('rentova_token', newToken);
    localStorage.setItem('rentova_user', JSON.stringify(userData));
    return userData;
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const res = await api.post('/api/auth/register', { name, email, password, role });
    // Do not set token or user yet; wait for OTP verification
    return res.data;
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    const res = await api.post('/api/auth/verify-otp', { email, otp });
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('rentova_token', newToken);
    localStorage.setItem('rentova_user', JSON.stringify(userData));
    return userData;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('rentova_token');
    localStorage.removeItem('rentova_user');
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('rentova_user', JSON.stringify(userData));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, verifyOtp, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
