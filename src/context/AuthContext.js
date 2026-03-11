import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');
    if (token && saved) {
      setUser(JSON.parse(saved));
      userAPI.getMe()
        .then(r => { setUser(r.data.data); localStorage.setItem('user', JSON.stringify(r.data.data)); })
        .catch(() => { localStorage.clear(); setUser(null); })
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (creds) => {
    const r = await authAPI.login(creds);
    const { accessToken, ...u } = r.data.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (d) => {
    const r = await authAPI.register(d);
    const { accessToken, ...u } = r.data.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    toast.success('Logged out');
  };

  const updateUser = u => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); };

  return <Ctx.Provider value={{ user, loading, login, register, logout, updateUser }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
