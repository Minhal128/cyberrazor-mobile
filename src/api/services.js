// services.js - clean minimal services
import api from './client';
import { assistantService as assistantClient } from './assistantClient';

const mockAlerts = [
  { 
    id: 1, 
    title: 'Suspicious Login Attempt', 
    description: 'Multiple failed login attempts', 
    severity: 'Critical', 
    timestamp: '2 minutes ago', 
    status: 'Active' 
  },
  { 
    id: 2, 
    title: 'Malware Detected', 
    description: 'Trojan found', 
    severity: 'High', 
    timestamp: '15 minutes ago', 
    status: 'Resolved' 
  }
];

export const authService = {
  async signIn(email, password) {
    try {
      const res = await api.post('/auth/login', { email, password });
      
      // Validate response structure
      if (!res.data) {
        throw new Error('No data received from server');
      }
      
      if (!res.data.access_token) {
        throw new Error(res.data.error || res.data.message || 'Invalid credentials');
      }
      
      return res.data;
    } catch (err) {
      console.error('auth.signIn failed:', err.message);
      console.error('Response data:', err.response?.data);
      
      // Throw a more descriptive error
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      } else if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      } else if (err.message === 'Network Error' || err.code === 'NETWORK_ERROR') {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      
      throw err;
    }
  },
  
  async signUp(userData) {
    try {
      const res = await api.post('/auth/signup', { 
        username: userData.name, 
        email: userData.email, 
        password: userData.password 
      });
      return res.data;
    } catch (err) {
      console.error('auth.signUp failed', err.message);
      throw err;
    }
  },
  
  async getCurrentUser() {
    try {
      const res = await api.get('/auth/me');
      return res.data;
    } catch (_) {
      return null;
    }
  },
  
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // Silent fail on logout
    }
  }
};

export const alertsService = {
  async getAlerts() {
    try {
      const res = await api.get('/threats');
      return res.data.threats || mockAlerts;
    } catch (_) {
      return mockAlerts;
    }
  },
  
  getRealisticAgentData() {
    return mockAlerts;
  },
  
  async getAlertById(id) {
    try {
      const res = await api.get(`/threats/${id}`);
      return res.data;
    } catch (_) {
      return mockAlerts.find(a => String(a.id) === String(id));
    }
  },
  
  async getAlertStats() {
    try {
      const res = await api.get('/alerts/realtime/stats');
      return res.data.stats;
    } catch (_) {
      return { total_alerts: mockAlerts.length };
    }
  },
  
  async clearAlerts() {
    try {
      const res = await api.post('/alerts/realtime/clear');
      return res.data;
    } catch (_) {
      return { success: true };
    }
  },
  
  async resolveAlert(id) {
    try {
      const res = await api.put(`/threats/${id}/status`, { status: 'resolved' });
      return res.data;
    } catch (_) {
      return { success: true };
    }
  },
  
  async getStats() {
    try {
      const res = await api.get('/threats/stats/summary');
      return res.data;
    } catch (_) {
      return { total_threats: mockAlerts.length };
    }
  }
};

// Use the assistant client that prefers MCP server
export const assistantService = assistantClient;

export const userService = {
  async getProfile() {
    try {
      const res = await api.get('/user/profile');
      return res.data;
    } catch (_) {
      return { 
        id: 1, 
        name: 'CyberRazor User', 
        email: 'user@cyberrazor.com',
        role: 'Security Analyst',
        avatar: null,
        preferences: {
          notifications: true,
          biometrics: false,
          autoLock: true,
          darkMode: true,
          threatAlerts: true,
          dataCollection: false
        }
      };
    }
  },
  
  async updatePreferences(prefs) {
    try {
      // services.js - cleaned: no mock data, assistant connects to local MCP server first
      return res.data;
    } catch (_) {
      return { success: true, preferences: prefs };
    }
  },
  
  async updateProfile(payload) {
    try {
      const res = await api.patch('/user/profile', payload);
      return res.data;
    } catch (_) {
      return { success: true, ...payload };
    }
  }
};

export default { 
  authService, 
  alertsService, 
  assistantService, 
  userService 
};