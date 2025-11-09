import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use deployed backend URL with network debugging
const BASE_URL = 'https://cyberrazorbackend.vercel.app/api';

// Alternative URLs to try if main fails
const BACKUP_URLS = [
  'https://cyberrazorbackend.vercel.app/api',
  'https://cyberrazor-backend.vercel.app/api'
];

// Test network connectivity
console.log('🌐 Backend URL:', BASE_URL);
console.log('📱 Device network info: Checking connectivity...');

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Add these for better mobile compatibility
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Accept 4xx errors as valid responses
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('cyberrazor_token');
  console.log('🔑 API Request:', config.method?.toUpperCase(), config.url);
  console.log('🌐 Full URL:', `${config.baseURL}${config.url}`);
  console.log('🎫 Token available:', token ? 'Yes' : 'No');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔐 Authorization header set');
  } else {
    console.log('⚠️ No token found in storage');
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.log('❌ API Error Details:');
    console.log('  - URL:', error.config?.url);
    console.log('  - Method:', error.config?.method?.toUpperCase());
    console.log('  - Status:', error.response?.status);
    console.log('  - Message:', error.message);
    console.log('  - Network Error:', error.code === 'NETWORK_ERROR' || error.message === 'Network Error');
    
    if (error.response?.status === 401) {
      console.log('🔒 Authentication failed - clearing tokens');
      // Token expired or invalid, clear storage and redirect to login
      await AsyncStorage.multiRemove(['cyberrazor_token', 'cyberrazor_user']);
      // You can dispatch a logout action here if using Redux
    }
    return Promise.reject(error);
  }
);

export default api;



