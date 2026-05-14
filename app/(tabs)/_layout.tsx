import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0a1628',
          borderTopColor: '#1e3a5f',
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#4a7aa0',
        headerStyle: { backgroundColor: '#0a1628' },
        headerTintColor: '#ffffff',
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Alarm',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⏰" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🐦" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
