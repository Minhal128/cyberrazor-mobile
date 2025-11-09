import React from 'react';
import { View, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';

export function AlertDetailScreen() {
  const route = useRoute();
  const alert = route.params?.alert || {};
  return (
    <View className="flex-1 bg-black px-6 py-12">
      <Text className="text-white text-2xl font-bold mb-4">{alert.title || 'Alert Detail'}</Text>
      <Text className="text-white mb-2">Severity: {alert.severity || 'Unknown'}</Text>
      <Text className="text-neutral-400 mb-2">Time: {alert.timestamp || alert.time || ''}</Text>
      <Text className="text-white opacity-80">{alert.description || 'No additional details.'}</Text>
    </View>
  );
}



