import { createContext, useContext, useState } from 'react';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { toast } from 'react-toastify';

// Unified AuthContext Instance
export const AuthContext = createContext(null);

// Unified useAuth Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Unified AuthProvider Component
export const AuthProvider = ({ children }) => {
  // Lazily hydrate initial user directly from localStorage
  const [user, setUser] = useState(() => {
    try {
      storageService.init();
      return storageService.getActiveUser();
    } catch (err) {
      console.error('Error hydrating auth state:', err);
      return null;
    }
  });
  const [loading] = useState(false);

  // Login handler
  const login = async ({ email, password, role, rememberMe = false }) => {
    try {
      const response = await authService.login({ email, password, role });
      setUser(response.user);
      storageService.setRememberedEmail(email, rememberMe);
      toast.success(response.message || 'Login successful!');
      return response.user;
    } catch (error) {
      toast.error(error.message || 'Login failed. Please try again.');
      throw error;
    }
  };

  // Register handler
  const register = async (registrationData) => {
    try {
      const response = await authService.register(registrationData);
      setUser(response.user);
      toast.success('Registration successful! Welcome aboard.');
      return response.user;
    } catch (error) {
      toast.error(error.message || 'Registration failed.');
      throw error;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.info('You have logged out.');
    } catch {
      storageService.clearSession();
      setUser(null);
      toast.info('Logged out.');
    }
  };

  // Update profile in state and localStorage
  const updateProfile = (updatedFields) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    storageService.setActiveUser(updated);

    // Also update in all users array
    const users = storageService.getUsers().map((u) => (u.id === user.id ? updated : u));
    localStorage.setItem('jps_users', JSON.stringify(users));
    toast.success('Profile updated successfully!');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    role: user?.role || null,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
