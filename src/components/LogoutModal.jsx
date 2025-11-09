import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export function LogoutModal({ visible, onCancel, onConfirm }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Glow animation
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
      ).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      glowAnim.setValue(0);
    }
  }, [visible]);

  const handleCancel = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onCancel());
  };

  const handleConfirm = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onConfirm());
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleCancel}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: fadeAnim,
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          }}
        >
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: width * 0.85,
              borderRadius: 24,
              padding: 32,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(0, 212, 255, 0.3)',
              shadowColor: '#00d4ff',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            {/* Animated Glow Effect */}
            <Animated.View
              style={{
                position: 'absolute',
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                borderRadius: 26,
                borderWidth: 2,
                borderColor: '#00d4ff',
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 0.6],
                }),
              }}
            />

            {/* Icon */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                borderWidth: 2,
                borderColor: 'rgba(0, 212, 255, 0.3)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <Ionicons name="log-out-outline" size={36} color="#00d4ff" />
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: 24,
                color: '#ffffff',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 12,
                textShadowColor: '#00d4ff',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 8,
              }}
            >
              See You Soon! 👋
            </Text>

            {/* Message */}
            <Text
              style={{
                fontSize: 16,
                color: '#b0c4de',
                textAlign: 'center',
                lineHeight: 24,
                marginBottom: 32,
              }}
            >
              Thanks for using CyberRazor! Your security data will be safely stored and ready when you return.
            </Text>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 16, width: '100%' }}>
              {/* Cancel Button */}
              <TouchableOpacity
                onPress={handleCancel}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Stay Logged In
                </Text>
              </TouchableOpacity>

              {/* Confirm Button */}
              <TouchableOpacity
                onPress={handleConfirm}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  backgroundColor: '#00d4ff',
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: 'center',
                  shadowColor: '#00d4ff',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Text
                  style={{
                    color: '#000000',
                    fontSize: 16,
                    fontWeight: '700',
                  }}
                >
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
