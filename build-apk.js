#!/usr/bin/env node

/**
 * CyberRazor Mobile APK Build Script
 * Alternative build method using Expo CLI
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building CyberRazor Mobile APK...\n');

try {
  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    throw new Error('Please run this script from the mobile directory');
  }

  // Check if Expo CLI is installed
  try {
    execSync('expo --version', { stdio: 'pipe' });
  } catch (error) {
    console.log('📦 Installing Expo CLI...');
    execSync('npm install -g @expo/cli', { stdio: 'inherit' });
  }

  // Login to Expo (if needed)
  console.log('🔐 Checking Expo login status...');
  try {
    execSync('expo whoami', { stdio: 'pipe' });
    console.log('✅ Already logged in to Expo');
  } catch (error) {
    console.log('🔑 Please login to Expo:');
    execSync('expo login', { stdio: 'inherit' });
  }

  // Build APK using Expo build
  console.log('\n🏗️  Building Android APK...');
  console.log('This may take 10-15 minutes...\n');
  
  execSync('expo build:android --type apk', { stdio: 'inherit' });

  console.log('\n🎉 APK build completed successfully!');
  console.log('📱 Your APK is ready for download and installation');
  console.log('\nNext steps:');
  console.log('1. Download the APK from the Expo dashboard');
  console.log('2. Install on Android device');
  console.log('3. Test the CyberRazor mobile app');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.log('\n🔧 Alternative build methods:');
  console.log('1. Use EAS Build: eas build --platform android --profile preview');
  console.log('2. Use Expo Build: expo build:android --type apk');
  console.log('3. Use local build: npx expo run:android');
  process.exit(1);
}
