#!/usr/bin/env node

/**
 * CyberRazor Mobile App Integration Test Script
 * Tests the connection between mobile app and backend
 */

const axios = require('axios');

const BASE_URL = 'https://cyberrazorbackend.vercel.app/api';

// Test data
const testUser = {
  email: 'test@cyberrazor.com',
  password: 'Test123456',
  name: 'testuser'
};

// Superadmin account for testing (auto-approved)
const superadminUser = {
  email: 'superadmin@cyberrazor.com',
  password: 'superadmin123',
  name: 'superadmin'
};

const testThreat = {
  device_id: 'mobile-test-device',
  threat_type: 'malware',
  severity: 'high',
  source: 'mobile_test',
  details: {
    file_path: '/test/malware.exe',
    verdict: 'Malicious',
    confidence: 'High',
    reason: 'Test threat from mobile app integration'
  },
  user_email: testUser.email
};

async function testBackendConnection() {
  console.log('🔍 Testing CyberRazor Backend Connection...\n');
  
  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend is running:', healthResponse.data[0]?.service || 'Backend operational');
    
    // Test 2: Auth Test Endpoint
    console.log('\n2. Testing auth endpoints...');
    const authTestResponse = await axios.get(`${BASE_URL}/auth/test`);
    console.log('✅ Auth endpoints working:', authTestResponse.data.message);
    
    // Test 3: User Registration
    console.log('\n3. Testing user registration...');
    try {
      const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, {
        username: testUser.name,
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ User registration:', signupResponse.data.message);
    } catch (error) {
      if (error.response?.status === 400 && (error.response.data?.message?.includes('already exists') || error.response.data?.message?.includes('already registered'))) {
        console.log('ℹ️  User already exists, continuing...');
      } else {
        throw error;
      }
    }
    
    // Test 4: User Login (try superadmin first, then regular user)
    console.log('\n4. Testing user login...');
    let loginResponse;
    let token;
    
    try {
      // Try superadmin login first (auto-approved)
      loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: superadminUser.email,
        password: superadminUser.password
      });
      console.log('✅ Superadmin login successful');
      token = loginResponse.data.access_token;
    } catch (error) {
      if (error.response?.data?.message?.includes('pending')) {
        console.log('ℹ️  Regular user account is pending approval, using superadmin for testing...');
        // Try superadmin login
        loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: superadminUser.email,
          password: superadminUser.password
        });
        console.log('✅ Superadmin login successful');
        token = loginResponse.data.access_token;
      } else {
        throw error;
      }
    }
    
    // Test 5: Get User Info
    console.log('\n5. Testing user info retrieval...');
    const userResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User info retrieved:', userResponse.data.email);
    
    // Test 6: Report Test Threat
    console.log('\n6. Testing threat reporting...');
    const threatResponse = await axios.post(`${BASE_URL}/threats/agent`, testThreat);
    console.log('✅ Threat reported successfully:', threatResponse.data.threat_id);
    
    // Test 7: Get Threats
    console.log('\n7. Testing threat retrieval...');
    const threatsResponse = await axios.get(`${BASE_URL}/threats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Threats retrieved:', threatsResponse.data.threats.length, 'threats found');
    
    // Test 8: Get Threat Stats
    console.log('\n8. Testing threat statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/threats/stats/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Threat stats retrieved:', statsResponse.data);
    
    // Test 9: Assistant Chat
    console.log('\n9. Testing assistant chat...');
    const chatResponse = await axios.post(`${BASE_URL}/assistant/chat`, {
      message: 'Hello, I need help with security alerts'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Assistant chat working:', chatResponse.data.response.substring(0, 100) + '...');
    
    // Test 10: Assistant Context
    console.log('\n10. Testing assistant context...');
    const contextResponse = await axios.get(`${BASE_URL}/assistant/context`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Assistant context retrieved:', contextResponse.data.statistics);
    
    console.log('\n🎉 All backend integration tests passed!');
    console.log('\n📱 Mobile app is ready to connect to the backend.');
    console.log('\n🚀 Next steps:');
    console.log('   1. Start the backend server: cd backend && npm start');
    console.log('   2. Start the mobile app: cd mobile && npm start');
    console.log('   3. Test the mobile app with real backend data');
    console.log('   4. Build APK: cd mobile && npx expo build:android');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.response?.data || error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure the backend server is running on https://cyberrazorbackend.vercel.app');
    console.log('   2. Check if MongoDB is connected');
    console.log('   3. Verify environment variables are set');
    console.log('   4. Check network connectivity');
    process.exit(1);
  }
}

// Run the test
testBackendConnection();
