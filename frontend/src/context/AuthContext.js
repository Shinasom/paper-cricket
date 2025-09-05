'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api'; // This is our updated, JWT-aware api service

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for an existing token when the app loads
    async function initializeAuth() {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Verify the token by fetching the user data
          const userData = await api.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // This can happen if the token is expired or invalid
          console.error("Failed to initialize auth with token", error);
          setUser(null);
          // Clean up old tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    }
    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      // The api.loginUser function handles storing tokens in localStorage
      await api.loginUser(username, password);
      // After tokens are stored, we fetch the user data to update our global state
      const userData = await api.getCurrentUser();
      setUser(userData);
      router.push('/');
    } catch (error) {
      throw error;
    }
  };
  
  const register = async (username, password) => {
    try {
      await api.registerUser(username, password);
      // After a successful registration, we immediately log the user in
      await login(username, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // The api.logoutUser function now just clears the tokens from localStorage
    api.logoutUser();
    setUser(null);
    router.push('/');
  };

  const value = { user, loading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {/* We wait until the initial loading is done before rendering the app */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

// This custom hook makes it easy for any component to access the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

