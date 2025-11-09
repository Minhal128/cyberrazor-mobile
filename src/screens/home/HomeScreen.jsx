import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { alertsService } from '../../api/services';

const { width, height } = Dimensions.get('window');

export function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    total_threats: 0,
    threats_today: 0,
    resolved_threats: 0,
    active_threats: 0
  });
  const [loading, setLoading] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;

  useEffect(() => {
    loadData();
    
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
      Animated.stagger(150, 
        cardAnims.map(anim => 
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        )
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load alerts first, then stats (since stats depends on alerts)
      const alertsData = await alertsService.getAlerts();
      const statsData = await alertsService.getStats();
      
      console.log('📊 Loaded stats data:', statsData);
      console.log('📱 Loaded alerts data:', alertsData?.length, 'alerts');
      console.log('🔍 Stats breakdown:', {
        total_threats: statsData.total_threats,
        threats_today: statsData.threats_today,
        resolved_threats: statsData.resolved_threats,
        active_threats: statsData.active_threats
      });
      
      setAlerts(alertsData.slice(0, 4)); // Show only first 4 alerts
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#00d4ff';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'warning';
      case 'high': return 'bug';
      case 'medium': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'shield';
    }
  };

  const statsData = [
    { label: 'Total Threats', value: stats.total_threats?.toString() || '0', icon: 'shield', color: '#ef4444' },
    { label: 'Threats Today', value: stats.threats_today?.toString() || '0', icon: 'search', color: '#00d4ff' },
    { label: 'Resolved', value: stats.resolved_threats?.toString() || '0', icon: 'checkmark-circle', color: '#10b981' },
    { label: 'Active Alerts', value: stats.active_threats?.toString() || '0', icon: 'eye', color: '#f59e0b' }
  ];

  return (
    <LinearGradient 
      colors={['#0a0a0f', '#1a1a2e', '#16213e', '#0f3460']} 
      start={{x:0,y:0}} 
      end={{x:1,y:1}} 
      style={{flex:1}}
    >
      {/* Background decorative blob removed as requested */}
      
      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4ff" />
        }
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <View>
              <Text style={{
                fontSize: 28,
                color: '#ffffff',
                fontWeight: 'bold',
                textShadowColor: '#00d4ff',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 8
              }}>
                Welcome Back{user?.name ? `, ${user.name}` : ''}
              </Text>
              <Text style={{
                fontSize: 16,
                color: '#b0c4de',
                marginTop: 4
              }}>
                Your security dashboard
              </Text>
            </View>
            {/* Notification icon removed */}
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View 
          style={{
            paddingHorizontal: 24,
            marginBottom: 24,
            opacity: cardAnims[0]
          }}
        >
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 12
          }}>
            {statsData.map((stat, index) => (
              <View key={index} style={{
                width: (width - 60) / 2,
                backgroundColor: 'rgba(0, 212, 255, 0.05)',
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: 'rgba(0, 212, 255, 0.1)'
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: `${stat.color}20`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 8
                  }}>
                    <Ionicons name={stat.icon} size={16} color={stat.color} />
                  </View>
                </View>
                <Text style={{
                  fontSize: 24,
                  color: '#ffffff',
                  fontWeight: 'bold',
                  marginBottom: 4
                }}>
                  {stat.value}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: '#8892b0'
                }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Recent Alerts Section */}
        <Animated.View 
          style={{
            paddingHorizontal: 24,
            marginBottom: 24,
            opacity: cardAnims[1]
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{
              fontSize: 20,
              color: '#ffffff',
              fontWeight: 'bold'
            }}>
              Recent Alerts
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Alerts')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(0, 212, 255, 0.3)'
              }}
            >
              <Text style={{ color: '#00d4ff', fontSize: 14, marginRight: 4 }}>View All</Text>
              <Ionicons name="arrow-forward" size={14} color="#00d4ff" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={{ color: '#8892b0' }}>Loading alerts...</Text>
            </View>
          ) : alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <Animated.View
                key={alert.id}
                style={{
                  opacity: cardAnims[2],
                  transform: [{
                    translateX: cardAnims[2].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0]
                    })
                  }]
                }}
              >
                <TouchableOpacity 
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                  onPress={() => navigation.navigate('AlertDetail', { alertId: alert.id })}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${getSeverityColor(alert.severity)}20`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}>
                    <Ionicons name={getSeverityIcon(alert.severity)} size={20} color={getSeverityColor(alert.severity)} />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 16,
                      color: '#ffffff',
                      fontWeight: '600',
                      marginBottom: 4
                    }}>
                      {alert.title}
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: '#8892b0',
                      marginBottom: 4
                    }}>
                      {alert.description}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: '#64748b'
                    }}>
                      {alert.timestamp}
                    </Text>
                  </View>
                  
                </TouchableOpacity>
              </Animated.View>
            ))
          ) : (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Ionicons name="shield-checkmark" size={48} color="#10b981" style={{ marginBottom: 12 }} />
              <Text style={{ color: '#10b981', fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                All Clear!
              </Text>
              <Text style={{ color: '#8892b0', fontSize: 14, textAlign: 'center' }}>
                No active security alerts at this time
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Quick Actions removed as requested */}
      </ScrollView>
    </LinearGradient>
  );
}



