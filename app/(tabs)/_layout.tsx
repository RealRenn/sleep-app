import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Balance' }} />
      <Tabs.Screen name="flight" options={{ href: null, title: 'Rewards' }} />
      <Tabs.Screen name="seat" options={{ href: null, title: 'Seat 01A' }} />
      <Tabs.Screen name="ticket" options={{ href: null, title: 'Check In' }} />
      <Tabs.Screen name="takeoff" options={{ href: null, title: 'Ready' }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
