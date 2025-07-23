import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Chrome as Home, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          borderTopWidth: 1,
          borderRadius: 20,
          marginHorizontal: 20,
          marginBottom: 20,
          paddingBottom: 10,
          paddingTop: 10,
          height: 70,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#666666',
        tabBarBackground: () => (
          <BlurView intensity={20} tint="dark" style={{ flex: 1, borderRadius: 20 }} />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}