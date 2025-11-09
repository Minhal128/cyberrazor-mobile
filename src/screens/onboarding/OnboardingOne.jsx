import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export function OnboardingOne() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

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
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

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
          top: height * 0.1,
          right: -50,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: '#00d4ff',
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.1, 0.3]
          }),
          transform: [{
            scale: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.2]
            })
          }]
        }}
      />
      
      <Animated.View 
        style={{
          position: 'absolute',
          bottom: height * 0.3,
          left: -30,
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: '#0099ff',
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 0.4]
          })
        }}
      />

      <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 48, justifyContent: 'space-between' }}>
        {/* Header Section */}
        <Animated.View 
          style={{
            alignItems: 'center',
            marginTop: 60,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
          }}
        >
          {/* Glowing Image Container */}
          <Animated.View
            style={{
              shadowColor: '#00d4ff',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8]
              }),
              shadowRadius: 20,
              elevation: 20,
            }}
          >
            <View style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: 'rgba(0, 212, 255, 0.05)',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 3,
              borderColor: '#00d4ff',
              padding: 20
            }}>
              <Image 
                source={require('../../../assets/logo.png')} 
                style={{ width: 160, height: 160, borderRadius: 80 }} 
                resizeMode="contain"
              />
            </View>
          </Animated.View>
          
          {/* Title */}
          <Animated.Text 
            style={{
              fontSize: 36,
              color: '#ffffff',
              fontWeight: 'bold',
              marginTop: 32,
              textAlign: 'center',
              textShadowColor: '#00d4ff',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 10,
              opacity: fadeAnim
            }}
          >
            CyberRazor
          </Animated.Text>
          
          {/* Subtitle */}
          <Animated.Text 
            style={{
              fontSize: 18,
              color: '#b0c4de',
              fontWeight: '600',
              marginTop: 16,
              textAlign: 'center',
              lineHeight: 26,
              opacity: fadeAnim
            }}
          >
            Next-Gen AI Security{"\n"}Operations Platform
          </Animated.Text>
          
          {/* Description */}
          <Animated.Text 
            style={{
              fontSize: 14,
              color: '#8892b0',
              marginTop: 24,
              textAlign: 'center',
              lineHeight: 20,
              paddingHorizontal: 20,
              opacity: fadeAnim
            }}
          >
            Experience the future of cybersecurity with advanced AI-powered threat detection and automated response systems.
          </Animated.Text>
        </Animated.View>

        {/* Bottom Section */}
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          {/* Privacy Policy */}
          <Text style={{
            color: '#64748b',
            textAlign: 'center',
            marginBottom: 24,
            fontSize: 12
          }}>
            By continuing, you agree to our Privacy Policy & Terms of Service
          </Text>
          
          {/* Continue Button */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('OnboardingTwo')} 
            activeOpacity={0.8}
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              shadowColor: '#00d4ff',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8
            }}
          >
            <LinearGradient 
              colors={['#0099ff', '#00d4ff', '#0099ff']} 
              start={{x:0,y:0}} 
              end={{x:1,y:0}}
              style={{
                paddingVertical: 18,
                paddingHorizontal: 32,
                alignItems: 'center',
                borderRadius: 16
              }}
            >
              <Text style={{
                color: '#000000',
                fontSize: 16,
                fontWeight: 'bold',
                letterSpacing: 1
              }}>
                CONTINUE
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}


