import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Animated, Dimensions, KeyboardAvoidingView, Platform, Modal, Clipboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Toast } from '../../components/Toast';

const { width, height } = Dimensions.get('window');

export function SignInScreen() {
  const { signIn } = useAuth();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [showSignupModal, setShowSignupModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(formAnim, {
          toValue: 1,
          duration: 1200,
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

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ visible: false, message: '', type: 'success' });
  };

  const copyWebsiteUrl = async () => {
    const websiteUrl = 'https://cyberrazor.vercel.app/';
    await Clipboard.setString(websiteUrl);
    showToast('Website URL copied to clipboard!', 'success');
  };

  const handleSubmit = async () => {
    setError('');
    
    // Email validation
    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    
    // Password validation
    if (!password) {
      showToast('Please enter your password', 'error');
      return;
    }
    
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await signIn(email, password);
      showToast('Welcome back! Signing you in...', 'success');
      setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
      }, 1000);
    } catch (e) {
      showToast('Invalid email or password. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

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
          top: height * 0.15,
          right: -60,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: '#00d4ff',
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.1, 0.25]
          }),
          transform: [{
            scale: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.3]
            })
          }]
        }}
      />
      
      <Animated.View 
        style={{
          position: 'absolute',
          bottom: height * 0.2,
          left: -40,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: '#0099ff',
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.15, 0.3]
          })
        }}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 48, justifyContent: 'center' }}>
          {/* Header Section */}
          <Animated.View 
            style={{
              alignItems: 'center',
              marginBottom: 60,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <Text style={{
              fontSize: 36,
              color: '#ffffff',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 12,
              textShadowColor: '#00d4ff',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 10
            }}>
              Welcome Back
            </Text>
            
            <Text style={{
              fontSize: 16,
              color: '#b0c4de',
              textAlign: 'center',
              marginBottom: 8
            }}>
              Sign in to CyberRazor Mobile
            </Text>
            <Text style={{
              fontSize: 12,
              color: '#64748b',
              textAlign: 'center',
              marginBottom: 16
            }}>
              Enter your credentials to continue
            </Text>
            
            <View style={{
              width: 60,
              height: 3,
              backgroundColor: '#00d4ff',
              borderRadius: 2,
              marginTop: 8
            }} />
          </Animated.View>

          {/* Form Section */}
          <Animated.View 
            style={{
              opacity: formAnim,
              transform: [{ 
                translateY: formAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0]
                })
              }]
            }}
          >
            {/* Error Message */}
            {!!error && (
              <Animated.View style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(239, 68, 68, 0.3)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Ionicons name="alert-circle" size={20} color="#ef4444" style={{ marginRight: 8 }} />
                <Text style={{ color: '#ef4444', fontSize: 14, flex: 1 }}>{error}</Text>
              </Animated.View>
            )}

            {/* Email Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                color: '#b0c4de',
                fontSize: 14,
                marginBottom: 8,
                fontWeight: '500'
              }}>
                Email Address
              </Text>
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16
              }}>
                <Ionicons name="mail" size={20} color="#8892b0" style={{ marginRight: 12 }} />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#64748b"
                  style={{
                    flex: 1,
                    color: '#ffffff',
                    fontSize: 16,
                    paddingVertical: 18
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{
                color: '#b0c4de',
                fontSize: 14,
                marginBottom: 8,
                fontWeight: '500'
              }}>
                Password
              </Text>
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16
              }}>
                <Ionicons name="lock-closed" size={20} color="#8892b0" style={{ marginRight: 12 }} />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#64748b"
                  style={{
                    flex: 1,
                    color: '#ffffff',
                    fontSize: 16,
                    paddingVertical: 18
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="done"
                  value={password}
                  onChangeText={setPassword}
                  onSubmitEditing={handleSubmit}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#8892b0" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity 
              onPress={handleSubmit} 
              activeOpacity={0.8}
              disabled={loading}
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                shadowColor: '#00d4ff',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
                marginBottom: 24
              }}
            >
              <LinearGradient 
                colors={loading ? ['#64748b', '#64748b'] : ['#0099ff', '#00d4ff', '#0099ff']} 
                start={{x:0,y:0}} 
                end={{x:1,y:0}}
                style={{
                  paddingVertical: 18,
                  paddingHorizontal: 32,
                  alignItems: 'center',
                  borderRadius: 16,
                  flexDirection: 'row',
                  justifyContent: 'center'
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Text style={{
                      color: '#000000',
                      fontSize: 16,
                      fontWeight: 'bold',
                      letterSpacing: 1,
                      marginRight: 8
                    }}>
                      SIGN IN
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#000000" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign Up Button */}
            <TouchableOpacity 
              onPress={() => setShowSignupModal(true)}
              activeOpacity={0.8}
              style={{
                borderRadius: 16,
                borderWidth: 2,
                borderColor: '#00d4ff',
                backgroundColor: 'transparent',
                paddingVertical: 16,
                paddingHorizontal: 32,
                alignItems: 'center',
                marginTop: 16
              }}
            >
              <Text style={{
                color: '#00d4ff',
                fontSize: 16,
                fontWeight: 'bold',
                letterSpacing: 1
              }}>
                SIGN UP
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
      
      {/* Signup Modal */}
      <Modal
        visible={showSignupModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSignupModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24
        }}>
          <View style={{
            backgroundColor: '#1a1a2e',
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 350,
            borderWidth: 1,
            borderColor: 'rgba(0, 212, 255, 0.3)'
          }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Ionicons name="globe-outline" size={32} color="#00d4ff" />
              <Text style={{
                fontSize: 20,
                color: '#ffffff',
                fontWeight: 'bold',
                marginTop: 8,
                textAlign: 'center'
              }}>
                Create Account
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#b0c4de',
                textAlign: 'center',
                marginTop: 4
              }}>
                Register on our website
              </Text>
            </View>

            {/* Website URL */}
            <View style={{
              backgroundColor: 'rgba(0, 212, 255, 0.1)',
              borderWidth: 1,
              borderColor: 'rgba(0, 212, 255, 0.3)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20
            }}>
              <Text style={{
                color: '#00d4ff',
                fontSize: 16,
                textAlign: 'center',
                marginBottom: 12
              }}>
                https://cyberrazor.vercel.app/
              </Text>
              
              <TouchableOpacity
                onPress={copyWebsiteUrl}
                style={{
                  backgroundColor: '#00d4ff',
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Ionicons name="copy" size={16} color="#000000" style={{ marginRight: 8 }} />
                <Text style={{
                  color: '#000000',
                  fontSize: 14,
                  fontWeight: '600'
                }}>
                  COPY URL
                </Text>
              </TouchableOpacity>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setShowSignupModal(false)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 12,
                alignItems: 'center'
              }}
            >
              <Text style={{
                color: '#ffffff',
                fontSize: 16,
                fontWeight: '600'
              }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </LinearGradient>
  );
}



