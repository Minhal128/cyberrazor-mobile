import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../store/AuthContext';
import { OnboardingOne } from '../screens/onboarding/OnboardingOne';
import { OnboardingTwo } from '../screens/onboarding/OnboardingTwo';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { AlertsScreen } from '../screens/alerts/AlertsScreen';
import { AlertDetailScreen } from '../screens/alerts/AlertDetailScreen';
import { AssistantScreen } from '../screens/assistant/AssistantScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';
import { useThemeMode } from '../theme/ThemeContext';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function TabsNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0b0f14', borderTopColor: '#0b0f14' },
        tabBarActiveTintColor: '#0072BD',
        tabBarInactiveTintColor: '#9aa4ad',
        tabBarIcon: ({ color, size }) => {
          const map = {
            Home: 'home',
            Alerts: 'warning',
            Assistant: 'chatbubbles',
            Settings: 'settings',
          };
          const name = map[route.name] || 'ellipse';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Alerts" component={AlertsScreen} />
      <Tabs.Screen name="Assistant" component={AssistantScreen} />
      <Tabs.Screen name="Settings" component={SettingsScreen} />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const { isDark } = useThemeMode();

  const theme = isDark ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isBootstrapping ? (
          <Stack.Screen name="Boot" component={OnboardingOne} />
        ) : isAuthenticated ? (
          <Stack.Screen name="Tabs" component={TabsNavigator} />
        ) : (
          <>
            <Stack.Screen name="OnboardingOne" component={OnboardingOne} />
            <Stack.Screen name="OnboardingTwo" component={OnboardingTwo} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="Tabs" component={TabsNavigator} />
          </>
        )}
        <Stack.Screen name="AlertDetail" component={AlertDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}



