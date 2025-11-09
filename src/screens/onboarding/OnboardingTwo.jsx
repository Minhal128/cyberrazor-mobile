import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export function OnboardingTwo() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;

  useEffect(() => {
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
      Animated.stagger(200, 
        itemAnims.map(anim => 
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          })
        )
      ),
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

  const features = [
    {
      icon: 'shield-checkmark',
      title: 'Advanced Security',
      description: 'Real-time threat detection and automated response'
    },
    {
      icon: 'brain',
      title: 'AI Assistant',
      description: 'Intelligent cybersecurity recommendations and insights'
    },
    {
      icon: 'notifications',
      title: 'Smart Alerts',
      description: 'Instant notifications for critical security events'
    },
    {
      icon: 'settings',
      title: 'Custom Controls',
      description: 'Personalized security settings and configurations'
    }
  ];

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
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: '#00d4ff',
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.1, 0.2]
          })
        }}
      />
      
      <Animated.View 
        style={{
          position: 'absolute',
          bottom: height * 0.1,
          right: -50,
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

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingHorizontal: 24, 
          paddingTop: 48,
          paddingBottom: 100,
          flexGrow: 1
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View 
          style={{
            marginTop: 60,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <Text style={{
            fontSize: 32,
            color: '#ffffff',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 16,
            textShadowColor: '#00d4ff',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 8
          }}>
            Powerful Features
          </Text>
          
          <Text style={{
            fontSize: 16,
            color: '#b0c4de',
            textAlign: 'center',
            marginBottom: 40,
            lineHeight: 24
          }}>
            Everything you need for comprehensive cybersecurity
          </Text>

          {/* Features List */}
          <View style={{ gap: 24, marginBottom: 60 }}>
            {features.map((feature, index) => (
              <Animated.View
                key={index}
                style={{
                  opacity: itemAnims[index],
                  transform: [{
                    translateX: itemAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 0]
                    })
                  }]
                }}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 212, 255, 0.05)',
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 212, 255, 0.2)'
                }}>
                  <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: 'rgba(0, 212, 255, 0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16
                  }}>
                    <Ionicons name={feature.icon} size={24} color="#00d4ff" />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 18,
                      color: '#ffffff',
                      fontWeight: '600',
                      marginBottom: 4
                    }}>
                      {feature.title}
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: '#8892b0',
                      lineHeight: 20
                    }}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Bottom Section */}
        <View style={{ flex: 1, justifyContent: 'flex-end', marginTop: 40 }}>
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
          <TouchableOpacity 
            onPress={() => navigation.navigate('SignIn')} 
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
                GET STARTED
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}


