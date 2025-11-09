import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export function AlertActionModal({ visible, alert, onClose, onAction }) {
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

  const handleAction = (action) => {
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
    ]).start(() => {
      onAction(action, alert);
      onClose();
    });
  };

  const handleClose = () => {
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
    ]).start(() => onClose());
  };

  const getSeverityConfig = (severity) => {
    const configs = {
      Critical: { color: '#ef4444', icon: 'warning' },
      High: { color: '#f97316', icon: 'alert-circle' },
      Medium: { color: '#f59e0b', icon: 'information-circle' },
      Low: { color: '#10b981', icon: 'checkmark-circle' },
      Info: { color: '#00d4ff', icon: 'information' }
    };
    return configs[severity] || configs.Info;
  };

  if (!alert) return null;

  const config = getSeverityConfig(alert.severity);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
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
              width: width * 0.9,
              borderRadius: 24,
              padding: 24,
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

            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: config.color + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16,
                }}
              >
                <Ionicons name={config.icon} size={24} color={config.color} />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    color: '#ffffff',
                    fontWeight: 'bold',
                    marginBottom: 4,
                  }}
                >
                  Security Alert Action
                </Text>
                <View style={{
                  backgroundColor: config.color,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 8,
                  alignSelf: 'flex-start'
                }}>
                  <Text style={{
                    color: '#ffffff',
                    fontSize: 10,
                    fontWeight: '600'
                  }}>
                    {alert.severity.toUpperCase()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="close" size={18} color="#8892b0" />
              </TouchableOpacity>
            </View>

            {/* Alert Info */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  color: '#ffffff',
                  fontWeight: '600',
                  marginBottom: 8,
                }}
              >
                {alert.title}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: '#b0c4de',
                  lineHeight: 20,
                  marginBottom: 12,
                }}
              >
                {alert.description}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: '#64748b',
                }}
              >
                {alert.timestamp} • {alert.source}
              </Text>
            </View>

            {/* Action Message */}
            <Text
              style={{
                fontSize: 14,
                color: '#8892b0',
                textAlign: 'center',
                marginBottom: 24,
                lineHeight: 20,
              }}
            >
              Choose an action for this security alert:
            </Text>

            {/* Action Buttons */}
            <View style={{ gap: 12 }}>
              {/* Keep Button */}
              <TouchableOpacity
                onPress={() => handleAction('keep')}
                activeOpacity={0.8}
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  borderRadius: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="checkmark-circle" size={20} color="#10b981" style={{ marginRight: 12 }} />
                <Text
                  style={{
                    color: '#10b981',
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Keep - Mark as Safe
                </Text>
              </TouchableOpacity>

              {/* Quarantine Button */}
              <TouchableOpacity
                onPress={() => handleAction('quarantine')}
                activeOpacity={0.8}
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(245, 158, 11, 0.3)',
                  borderRadius: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="lock-closed" size={20} color="#f59e0b" style={{ marginRight: 12 }} />
                <Text
                  style={{
                    color: '#f59e0b',
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Quarantine - Isolate Threat
                </Text>
              </TouchableOpacity>

              {/* Remove Button */}
              <TouchableOpacity
                onPress={() => handleAction('remove')}
                activeOpacity={0.8}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  borderRadius: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="trash" size={20} color="#ef4444" style={{ marginRight: 12 }} />
                <Text
                  style={{
                    color: '#ef4444',
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Remove - Delete Threat
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
