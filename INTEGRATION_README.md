# CyberRazor Mobile App - Backend Integration

This document describes the complete integration between the CyberRazor mobile app and the backend API.

## 🚀 Features Implemented

### 1. Authentication System
- **Login/Signup**: Connected to backend `/api/auth/login` and `/api/auth/signup`
- **Token Management**: Automatic token storage and refresh
- **User Context**: Real user data from backend
- **Account Status**: Handles pending/approved/rejected account states

### 2. Home Dashboard
- **Real-time Stats**: Displays actual threat statistics from backend
- **Recent Alerts**: Shows latest threats/alerts from user's machine
- **Dynamic Data**: Pulls data from `/api/threats` and `/api/threats/stats/summary`
- **Pull-to-Refresh**: Updates data in real-time

### 3. Alerts Management
- **Alert List**: Displays all user's threats/alerts
- **Filtering**: Filter by severity (Critical, High, Medium, Low)
- **Alert Actions**: Users can resolve, quarantine, or remove alerts
- **Real-time Updates**: Changes sync with backend immediately

### 4. AI Assistant
- **CyberRazor SOAR Focused**: Specialized for cybersecurity operations
- **Context-Aware**: Uses user's actual threat data for responses
- **Backend Integration**: Connected to `/api/assistant/chat` endpoint
- **Smart Responses**: Provides relevant security recommendations

## 🔧 Backend API Endpoints Used

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - User logout

### Threats/Alerts
- `GET /api/threats` - Get user's threats
- `GET /api/threats/:id` - Get specific threat details
- `PUT /api/threats/:id/status` - Update threat status
- `GET /api/threats/stats/summary` - Get threat statistics

### Assistant
- `POST /api/assistant/chat` - Chat with AI assistant
- `GET /api/assistant/context` - Get user's threat context

## 📱 Mobile App Structure

```
mobile/
├── src/
│   ├── api/
│   │   ├── client.js          # Axios configuration with auth
│   │   └── services.js        # API service functions
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── SignInScreen.jsx
│   │   │   └── SignUpScreen.jsx
│   │   ├── home/
│   │   │   └── HomeScreen.jsx
│   │   ├── alerts/
│   │   │   ├── AlertsScreen.jsx
│   │   │   └── AlertDetailScreen.jsx
│   │   └── assistant/
│   │       └── AssistantScreen.jsx
│   ├── store/
│   │   └── AuthContext.jsx    # Authentication state management
│   └── components/
│       └── AlertActionModal.jsx
└── test-integration.js        # Integration test script
```

## 🛠️ Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```

### 2. Mobile App Setup
```bash
cd mobile
npm install
```

### 3. Test Integration
```bash
cd mobile
node test-integration.js
```

### 4. Start Mobile App
```bash
cd mobile
npm start
```

## 🔐 Authentication Flow

1. **User Registration**: Creates account with pending status
2. **Admin Approval**: Admin approves account via backend
3. **User Login**: Authenticates and receives JWT token
4. **Token Storage**: Token stored securely in AsyncStorage
5. **Auto-refresh**: Token automatically refreshed on API calls

## 📊 Data Flow

### Home Screen
1. Loads user's threat statistics
2. Fetches recent alerts (last 4)
3. Displays real-time data with pull-to-refresh
4. Shows "All Clear" when no active threats

### Alerts Screen
1. Fetches all user's threats/alerts
2. Transforms backend data to mobile format
3. Allows filtering by severity
4. Enables user actions (resolve/quarantine/remove)

### Assistant Screen
1. Sends user messages to backend AI
2. Receives context-aware responses
3. Uses user's actual threat data for recommendations
4. Provides CyberRazor SOAR-specific guidance

## 🎯 Key Features

### Real-time Alerts
- Alerts come from user's machine tools
- Users can view, analyze, and take action
- Actions sync with backend immediately
- Status updates reflect in real-time

### AI Assistant
- Specialized for CyberRazor SOAR operations
- Context-aware responses based on user's threats
- Provides security recommendations
- Explains threat intelligence and incident response

### User Experience
- Beautiful, modern UI with animations
- Offline fallback with mock data
- Smooth navigation and interactions
- Professional cybersecurity theme

## 🚀 Building APK

### Prerequisites
1. Install Expo CLI: `npm install -g @expo/cli`
2. Create Expo account
3. Install EAS CLI: `npm install -g eas-cli`

### Build Commands
```bash
cd mobile

# Login to Expo
expo login

# Configure build
eas build:configure

# Build APK
eas build --platform android --profile preview

# Or build with Expo
npx expo build:android
```

## 🔧 Configuration

### Backend URL
Update `src/api/client.js`:
```javascript
const BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api' 
  : 'https://your-production-backend.com/api';
```

### Environment Variables
Create `.env` file in mobile directory:
```
EXPO_PUBLIC_API_URL=http://localhost:8000/api
EXPO_PUBLIC_APP_NAME=CyberRazor Mobile
```

## 🧪 Testing

### Integration Test
Run the integration test to verify backend connection:
```bash
cd mobile
node test-integration.js
```

### Manual Testing
1. Start backend server
2. Start mobile app
3. Test login/signup flow
4. Verify alerts display
5. Test assistant chat
6. Test alert actions

## 📋 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Check if backend is running on port 8000
   - Verify network connectivity
   - Check CORS configuration

2. **Authentication Issues**
   - Verify JWT secret in backend
   - Check token expiration settings
   - Clear AsyncStorage and retry

3. **No Alerts Showing**
   - Check if user has threats in database
   - Verify user email matches threat records
   - Check API response format

4. **Assistant Not Responding**
   - Verify assistant route is registered
   - Check if user is authenticated
   - Review assistant endpoint logs

## 🎉 Success Criteria

✅ **Authentication**: Users can login/signup with backend
✅ **Real-time Data**: Home screen shows actual threat statistics
✅ **Alert Management**: Users can view and act on alerts
✅ **AI Assistant**: Context-aware cybersecurity assistance
✅ **Offline Support**: Graceful fallback when backend unavailable
✅ **Professional UI**: Modern, animated cybersecurity interface

## 📞 Support

For issues or questions:
1. Check the integration test results
2. Review backend logs
3. Verify API endpoints are working
4. Test with Postman/curl first
5. Check mobile app console logs

The mobile app is now fully integrated with the CyberRazor backend and ready for production use!
