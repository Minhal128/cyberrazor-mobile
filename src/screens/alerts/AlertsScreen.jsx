import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Animated, Dimensions, RefreshControl, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { alertsService } from '../../api/services';
import { AlertActionModal } from '../../components/AlertActionModal';

const { width, height } = Dimensions.get('window');

const severityConfig = {
  critical: { color: '#ef4444', icon: 'warning', bgColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' },
  high: { color: '#f97316', icon: 'alert-circle', bgColor: 'rgba(249, 115, 22, 0.1)', borderColor: 'rgba(249, 115, 22, 0.3)' },
  medium: { color: '#f59e0b', icon: 'information-circle', bgColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' },
  low: { color: '#10b981', icon: 'checkmark-circle', bgColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' },
  info: { color: '#00d4ff', icon: 'information', bgColor: 'rgba(0, 212, 255, 0.1)', borderColor: 'rgba(0, 212, 255, 0.3)' }
};

export function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      try {
        const alertsData = await alertsService.getAlerts();
        setAlerts(alertsData);
      } catch (error) {
        console.error('Failed to load alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();

    // Animations
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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const alertsData = await alertsService.getAlerts();
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to refresh alerts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredAlerts = filter === 'All' ? alerts : alerts.filter(alert => 
    alert.severity?.toLowerCase() === filter.toLowerCase()
  );

  const filters = ['All', 'High', 'Medium', 'Low'];

  const handleAlertPress = (alert) => {
    setSelectedAlert(alert);
    setShowActionModal(true);
  };

  const handleAlertAction = async (action, alert) => {
    try {
      console.log(`Action: ${action} on alert:`, alert.id);
      
      // Map action to backend status
      let status;
      let notes;
      
      switch (action) {
        case 'keep':
          status = 'resolved';
          notes = 'Marked as safe by user via mobile app';
          break;
        case 'quarantine':
          status = 'investigating';
          notes = 'Quarantined by user via mobile app';
          break;
        case 'remove':
          status = 'resolved';
          notes = 'Removed by user via mobile app';
          break;
        default:
          status = 'resolved';
          notes = 'Action taken by user via mobile app';
      }
      
      // Call backend API to update threat status
      await alertsService.resolveAlert(alert.id);
      
      // Update local state
      setAlerts(prevAlerts => 
        prevAlerts.map(a => 
          a.id === alert.id 
            ? { ...a, status: action === 'keep' ? 'Resolved' : action === 'remove' ? 'Resolved' : 'Investigating' }
            : a
        )
      );
      
      console.log(`Successfully updated alert ${alert.id} with action: ${action}`);
    } catch (error) {
      console.error('Failed to update alert:', error);
      // Still update local state for better UX
      setAlerts(prevAlerts => 
        prevAlerts.map(a => 
          a.id === alert.id 
            ? { ...a, status: action === 'keep' ? 'Resolved' : action === 'remove' ? 'Resolved' : 'Investigating' }
            : a
        )
      );
    }
  };

  const handleCloseModal = () => {
    setShowActionModal(false);
    setSelectedAlert(null);
  };

  const renderAlert = ({ item, index }) => {
    const config = severityConfig[item.severity?.toLowerCase()] || severityConfig.info;
    
    return (
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
          onPress={() => handleAlertPress(item)}
          activeOpacity={0.8}
          style={{
            padding: 16,
            marginBottom: 12,
            marginHorizontal: 4
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12
            }}>
              <Ionicons name={config.icon} size={20} color={config.color} />
            </View>
            
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{
                  fontSize: 16,
                  color: '#ffffff',
                  fontWeight: '600',
                  flex: 1
                }}>
                  {item.title}
                </Text>
                <View style={{
                  backgroundColor: config.color,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12
                }}>
                  <Text style={{
                    color: '#ffffff',
                    fontSize: 10,
                    fontWeight: '600'
                  }}>
                    {item.severity.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={{
                fontSize: 14,
                color: '#8892b0',
                marginBottom: 8,
                lineHeight: 20
              }}>
                {item.description}
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{
                  fontSize: 12,
                  color: '#64748b'
                }}>
                  {item.timestamp} • {item.source}
                </Text>
                <View style={{
                  backgroundColor: item.status === 'Active' ? 'rgba(239, 68, 68, 0.2)' : 
                                  item.status === 'Resolved' ? 'rgba(16, 185, 129, 0.2)' : 
                                  'rgba(245, 158, 11, 0.2)',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 8
                }}>
                  <Text style={{
                    fontSize: 10,
                    color: item.status === 'Active' ? '#ef4444' : 
                           item.status === 'Resolved' ? '#10b981' : '#f59e0b',
                    fontWeight: '500'
                  }}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
            
            <Ionicons name="chevron-forward" size={16} color="#64748b" style={{ marginLeft: 8 }} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <LinearGradient 
        colors={['#0a0a0f', '#1a1a2e', '#16213e', '#0f3460']} 
        start={{x:0,y:0}} 
        end={{x:1,y:1}} 
        style={{flex:1, justifyContent: 'center', alignItems: 'center'}}
      >
        <ActivityIndicator size="large" color="#00d4ff" />
        <Text style={{ color: '#b0c4de', marginTop: 16, fontSize: 16 }}>Loading alerts...</Text>
      </LinearGradient>
    );
  }

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
            outputRange: [0.1, 0.2]
          })
        }}
      />

      <View style={{ flex: 1, paddingTop: 60 }}>
        {/* Header */}
        <Animated.View 
          style={{
            paddingHorizontal: 24,
            paddingBottom: 20,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{
              fontSize: 28,
              color: '#ffffff',
              fontWeight: 'bold',
              textShadowColor: '#00d4ff',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 8
            }}>
              Security Alerts
            </Text>
            {/* Filter icon removed as requested */}
          </View>
          
          <Text style={{
            fontSize: 16,
            color: '#b0c4de',
            marginBottom: 16
          }}>
            {filteredAlerts.length} active security events
          </Text>

          {/* Filter Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 8 }}
            contentContainerStyle={{ 
              flexGrow: 1, 
              justifyContent: 'center',
              paddingHorizontal: 24
            }}
          >
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
              {filters.map((filterOption) => (
                <TouchableOpacity
                  key={filterOption}
                  onPress={() => setFilter(filterOption)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: filter === filterOption ? '#00d4ff' : 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 1,
                    borderColor: filter === filterOption ? '#00d4ff' : 'rgba(0, 212, 255, 0.3)'
                  }}
                >
                  <Text style={{
                    color: filter === filterOption ? '#000000' : '#00d4ff',
                    fontSize: 12,
                    fontWeight: '600'
                  }}>
                    {filterOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Alerts List */}
        <FlatList
          data={filteredAlerts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAlert}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4ff" />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Alert Action Modal */}
      <AlertActionModal
        visible={showActionModal}
        alert={selectedAlert}
        onClose={handleCloseModal}
        onAction={handleAlertAction}
      />
    </LinearGradient>
  );
}
