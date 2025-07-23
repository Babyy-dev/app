import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { Settings, MapPin, Users, Calendar } from 'lucide-react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background */}
      <View style={styles.backgroundGradient} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity>
            <Settings size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <BlurView intensity={20} tint="dark" style={styles.profileBlur}>
            <Image
              source={{
                uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200'
              }}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>You</Text>
            <Text style={styles.profileHandle}>@genie_user</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>24</Text>
                <Text style={styles.statLabel}>Portals</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>156</Text>
                <Text style={styles.statLabel}>Friends</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>89</Text>
                <Text style={styles.statLabel}>Events</Text>
              </View>
            </View>
          </BlurView>
        </View>
        
        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <MenuOption icon={<MapPin size={20} color="white" />} title="My Locations" />
          <MenuOption icon={<Users size={20} color="white" />} title="Friends" />
          <MenuOption icon={<Calendar size={20} color="white" />} title="Events" />
        </View>
      </ScrollView>
    </View>
  );
}

function MenuOption({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <TouchableOpacity style={styles.menuOption}>
      <BlurView intensity={15} tint="dark" style={styles.menuBlur}>
        <View style={styles.menuIcon}>{icon}</View>
        <Text style={styles.menuTitle}>{title}</Text>
        <View style={styles.menuArrow} />
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#111111',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileBlur: {
    padding: 30,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileHandle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 4,
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuOption: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  menuArrow: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: '#CCCCCC',
    transform: [{ rotate: '45deg' }],
  },
});