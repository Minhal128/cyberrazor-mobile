import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Animated, Dimensions, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { userService } from '../../api/services';
import { useNavigation } from '@react-navigation/native';
import { LogoutModal } from '../../components/LogoutModal';

const { width, height } = Dimensions.get('window');

export function SettingsScreen() {
  const { user, signOut, updateUser } = useAuth();
  const navigation = useNavigation();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [autoLock, setAutoLock] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [threatAlerts, setThreatAlerts] = useState(true);
  const [dataCollection, setDataCollection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const profile = await userService.getProfile();
        if (profile.preferences) {
          setNotifications(profile.preferences.notifications);
          setBiometrics(profile.preferences.biometrics);
          setAutoLock(profile.preferences.autoLock);
          setDarkMode(profile.preferences.darkMode);
          setThreatAlerts(profile.preferences.threatAlerts);
          setDataCollection(profile.preferences.dataCollection);
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error);
      }
    };

    loadUserPreferences();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  // Keep local editable fields in sync with authenticated user when it changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const updatePreference = async (key, value) => {
    setLoading(true);
    try {
      const preferences = {
        notifications,
        biometrics,
        autoLock,
        darkMode,
        threatAlerts,
        dataCollection,
        [key]: value
      };
      await userService.updatePreferences(preferences);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      await userService.updateProfile({ name, email });
      await updateUser({ name, email });
      setEditVisible(false);
    } catch (e) {
      console.log('Failed to update profile:', e.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSignOut = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const SettingItem = ({ icon, title, subtitle, value, onValueChange, type = 'switch', onPress, danger = false }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0]
          })
        }]
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={type === 'switch'}
        activeOpacity={0.8}
        style={{
          padding: 16,
          marginBottom: 12,
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 16
        }}>
          <Ionicons name={icon} size={20} color={danger ? '#ef4444' : '#00d4ff'} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            color: danger ? '#ef4444' : '#ffffff',
            fontWeight: '600',
            marginBottom: 2
          }}>
            {title}
          </Text>
          {subtitle && (
            <Text style={{
              fontSize: 14,
              color: '#8892b0',
              lineHeight: 18
            }}>
              {subtitle}
            </Text>
          )}
        </View>

        {type === 'switch' ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#374151', true: '#00d4ff' }}
            thumbColor={value ? '#ffffff' : '#9ca3af'}
            ios_backgroundColor="#374151"
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const SectionHeader = ({ title }) => (
    <Animated.View
      style={{
        marginTop: 24,
        marginBottom: 12,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }}
    >
      <Text style={{
        fontSize: 18,
        color: '#00d4ff',
        fontWeight: 'bold',
        textShadowColor: '#00d4ff',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4
      }}>
        {title}
      </Text>
    </Animated.View>
  );

  return (
    <LinearGradient 
      colors={['#0a0a0f', '#1a1a2e', '#16213e', '#0f3460']} 
      start={{x:0,y:0}} 
      end={{x:1,y:1}} 
      style={{flex:1}}
    >
      {/* Animated Background Elements */}
      <Animated.View 
        style={{
          position: 'absolute',
          top: height * 0.2,
          left: -40,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: '#00d4ff',
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.1, 0.2]
          })
        }}
      />

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View 
          style={{
            paddingHorizontal: 24,
            paddingTop: 60,
            paddingBottom: 20,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0, 212, 255, 0.1)',
              borderWidth: 2,
              borderColor: 'rgba(0, 212, 255, 0.3)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12
            }}>
              <Ionicons name="settings" size={20} color="#00d4ff" />
            </View>
            <View>
              <Text style={{
                fontSize: 28,
                color: '#ffffff',
                fontWeight: 'bold',
                textShadowColor: '#00d4ff',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 8
              }}>
                Settings
              </Text>
              <Text style={{
                fontSize: 16,
                color: '#b0c4de'
              }}>
                Customize your security preferences
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Profile Section */}
          <SectionHeader title="Profile" />
          
          <Animated.View
            style={{
              backgroundColor: 'rgba(0, 212, 255, 0.05)',
              borderWidth: 1,
              borderColor: 'rgba(0, 212, 255, 0.2)',
              borderRadius: 16,
              padding: 20,
              marginBottom: 12,
              opacity: fadeAnim
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: 'rgba(0, 212, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16
              }}>
                <Ionicons name="person" size={28} color="#00d4ff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 20,
                  color: '#ffffff',
                  fontWeight: 'bold'
                }} numberOfLines={1} ellipsizeMode="tail">
                  {name || 'CyberRazor User'}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#b0c4de',
                  marginTop: 2
                }}>
                  {email || 'user@cyberrazor.com'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity onPress={() => setEditVisible(true)} style={{
              backgroundColor: 'rgba(0, 212, 255, 0.1)',
              borderWidth: 1,
              borderColor: 'rgba(0, 212, 255, 0.3)',
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
              alignItems: 'center'
            }}>
              <Text style={{
                color: '#00d4ff',
                fontSize: 14,
                fontWeight: '600'
              }}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Security Section */}
          <SectionHeader title="Security" />

          {/* Notifications Section */}
          <SectionHeader title="Notifications" />
          
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            subtitle="Receive alerts and security updates"
            value={notifications}
            onValueChange={(value) => {
              setNotifications(value);
              updatePreference('notifications', value);
            }}
          />


          {/* Support Section removed as requested */}

          {/* Danger Zone */}
          <SectionHeader title="Account" />
          
          <SettingItem
            icon="log-out"
            title="Sign Out"
            subtitle="Sign out of your CyberRazor account"
            type="navigation"
            onPress={handleSignOut}
            danger={true}
          />
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        transparent
        visible={editVisible}
        animationType="fade"
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: width - 40, backgroundColor: '#0f172a', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(0, 212, 255, 0.2)' }}>
            <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Edit Profile</Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#64748b"
              style={{ color: '#ffffff', borderWidth: 1, borderColor: 'rgba(0, 212, 255, 0.2)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }}
            />
            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ color: '#ffffff', borderWidth: 1, borderColor: 'rgba(0, 212, 255, 0.2)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity onPress={() => setEditVisible(false)} style={{ paddingVertical: 10, paddingHorizontal: 14 }}>
                <Text style={{ color: '#94a3b8' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveProfile} disabled={savingProfile} style={{
                backgroundColor: '#00d4ff',
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 16,
                opacity: savingProfile ? 0.7 : 1
              }}>
                <Text style={{ color: '#000000', fontWeight: '700' }}>{savingProfile ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
      <LogoutModal
        visible={showLogoutModal}
        onCancel={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </LinearGradient>
  );
}



