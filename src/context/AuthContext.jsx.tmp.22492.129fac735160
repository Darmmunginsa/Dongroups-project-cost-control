import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('pcc_user');
    const token = localStorage.getItem('pcc_token');
    if (saved && token) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await apiLogin(username, password);
    if (res.success) {
      localStorage.setItem('pcc_token', res.token);
      localStorage.setItem('pcc_user', JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('pcc_token');
    localStorage.removeItem('pcc_user');
    setUser(null);
  };

  // อัปเดต user ใน state + localStorage (ใช้หลัง edit profile)
  const refreshUser = (updatedFields) => {
    const newUser = { ...user, ...updatedFields };
    localStorage.setItem('pcc_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
