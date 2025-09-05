// src/context/AuthContext.js

'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api'; // Import all our api functions

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To check for existing session
  const router = useRouter();

  useEffect(() => {
    // Check if a user session exists when the app loads
    async function checkUserSession() {
      try {
        const userData = await api.getCurrentUser(); // We need to create this API function
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkUserSession();
  }, []);

  const login = async (username, password) => {
    try {
      const userData = await api.loginUser(username, password); // We need to create this
      setUser(userData);
      // Redirect to home page or dashboard after login
      router.push('/');
    } catch (error) {
      // Re-throw the error so the form can display it
      throw error;
    }
  };

  const register = async (username, password) => {
    try {
      const userData = await api.registerUser(username, password); // We need to create this
      setUser(userData);
      // Log in the user automatically after registration
      await login(username, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await api.logoutUser(); // We need to create this
    setUser(null);
    router.push('/');
  };

  const value = { user, loading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};