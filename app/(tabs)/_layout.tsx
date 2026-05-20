import React from 'react';
import { Tabs } from 'expo-router';
import { usePalette } from '../../theme/ThemeContext';
import { FONTS } from '../../theme/fonts';
import { BirdIcon } from '../../components/icons/BirdIcons';

export default function TabLayout() {
  const palette = usePalette();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
        },
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: palette.sub,
        tabBarLabelStyle: {
          fontFamily: FONTS.bodyMedium,
          fontSize: 11,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Alarms',
          tabBarIcon: ({ color, focused }) => (
            <BirdIcon name="songbird" color={color} size={focused ? 22 : 20} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <BirdIcon name="dove" color={color} size={focused ? 22 : 20} />
          ),
        }}
      />
    </Tabs>
  );
}
