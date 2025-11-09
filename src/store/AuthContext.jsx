import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../api/services';

const AuthContext = createContext({
  isAuthenticated: false,
  isBootstrapping: true,
  user: null,
  token: null,
  signIn: async (_email, _password) => {},
  signOut: async () => {},
  updateUser: async (_updates) => {},
});

const TOKEN_KEY = 'cyberrazor_token';
const USER_KEY = 'cyberrazor_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            // Try to get fresh user data from backend
            try {
              const userData = await authService.getCurrentUser();
              setUser(userData);
              await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
            } catch (error) {
              console.log('Failed to get user data:', error.message);
              // Token might be invalid, clear it
              await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
              setToken(null);
            }
          }
        }
      } catch (error) {
        console.error('Auth bootstrap error:', error);
      } finally {
        setIsBootstrapping(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (email, password) => {
    try {
      // Use the same authentication as website/tool
      const response = await authService.signIn(email, password);
      const { access_token, user: userData } = response;
      
      // Validate that we have the required data before storing
      if (!access_token) {
        throw new Error('No access token received from server');
      }
      
      if (!userData) {
        throw new Error('No user data received from server');
      }
      
      setToken(access_token);
      setUser(userData);
      
      await AsyncStorage.setItem(TOKEN_KEY, access_token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      return true;
    } catch (error) {
      console.error('Sign in error:', error.message);
      throw error;
    }
  }, []);


  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error.message);
    } finally {
      setToken(null);
      setUser(null);
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    }
  }, []);

  const updateUser = useCallback(async (updates) => {
    // Merge updates into current user and persist
    setUser((prev) => {
      const updated = { ...(prev || {}), ...(updates || {}) };
      AsyncStorage.setItem(USER_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: !!token,
      isBootstrapping,
      user,
      token,
      signIn,
      signOut,
      updateUser,
    }),
    [token, isBootstrapping, user, signIn, signOut, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}



