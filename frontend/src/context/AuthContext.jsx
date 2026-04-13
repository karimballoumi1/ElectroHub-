import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    
    if (token && email) {
      setUser({ email, role, token });
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, role } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('email', res.data.email);
    localStorage.setItem('role', role);
    setUser({ email: res.data.email, role, token });
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token, role } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('email', res.data.email);
    localStorage.setItem('role', role);
    setUser({ email: res.data.email, role, token });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
