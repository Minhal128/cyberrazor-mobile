import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export function Toast({ visible, message, type = 'success', onHide, duration = 3000 }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide && onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  if (!visible) return null;

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.9)',
          borderColor: '#10b981',
          icon: 'checkmark-circle',
          iconColor: '#ffffff'
        };
      case 'error':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.9)',
          borderColor: '#ef4444',
          icon: 'alert-circle',
          iconColor: '#ffffff'
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.9)',
          borderColor: '#f59e0b',
          icon: 'warning',
          iconColor: '#ffffff'
        };
      case 'info':
        return {
          backgroundColor: 'rgba(0, 212, 255, 0.9)',
          borderColor: '#00d4ff',
          icon: 'information-circle',
          iconColor: '#000000'
        };
      default:
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.9)',
          borderColor: '#10b981',
          icon: 'checkmark-circle',
          iconColor: '#ffffff'
        };
    }
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        zIndex: 9999,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View
        style={{
          backgroundColor: config.backgroundColor,
          borderWidth: 1,
          borderColor: config.borderColor,
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons 
          name={config.icon} 
          size={24} 
          color={config.iconColor} 
          style={{ marginRight: 12 }} 
        />
        <Text
          style={{
            flex: 1,
            color: config.iconColor,
            fontSize: 14,
            fontWeight: '500',
            lineHeight: 20,
          }}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
