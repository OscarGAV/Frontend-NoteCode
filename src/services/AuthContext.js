import React, { createContext, useContext, useState, useCallback } from 'react';
import { signIn as apiSignIn, signUp as apiSignUp } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('notecode_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (username, password) => {
    const data = await apiSignIn(username, password);
    // Response: { id, username, token }
    localStorage.setItem('notecode_token', data.token);
    localStorage.setItem('notecode_user', JSON.stringify({ id: data.id, username: data.username }));
    setUser({ id: data.id, username: data.username });
    return data;
  }, []);

  const register = useCallback(async (username, password, email) => {
    await apiSignUp(username, password, email);
    return login(username, password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('notecode_token');
    localStorage.removeItem('notecode_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
