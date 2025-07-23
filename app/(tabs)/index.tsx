import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  PanResponder,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  withSequence,
  withDelay,
  withRepeat,
} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { Chrome as Home, Send, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const [showSecondScreen, setShowSecondScreen] = useState(false);
  
  // Ripple Blur Transition
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const blurIntensity = useSharedValue(0);
  const rippleX = useSharedValue(SCREEN_WIDTH / 2);
  const rippleY = useSharedValue(100);
  
  // Liquid Gradient Cursor Trail
  const [isTrailActive, setIsTrailActive] = useState(false);
  const cursorX = useSharedValue(SCREEN_WIDTH / 2);
  const cursorY = useSharedValue(SCREEN_HEIGHT / 2);
  const liquidStretch = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const shakeY = useSharedValue(0);
  
  // Multiple liquid trail elements with black/gray gradient
  const liquidTrails = Array.from({ length: 8 }, (_, index) => ({
    x: useSharedValue(SCREEN_WIDTH / 2),
    y: useSharedValue(SCREEN_HEIGHT / 2),
    scale: useSharedValue(0),
    opacity: useSharedValue(0),
    rotation: useSharedValue(0),
  }));

  // Pan responder for liquid gradient cursor trail
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      setIsTrailActive(true);
      const { locationX, locationY } = evt.nativeEvent;
      cursorX.value = locationX;
      cursorY.value = locationY;
      
      // Start shake effect
      shakeX.value = withRepeat(
        withSequence(
          withTiming(3, { duration: 50 }),
          withTiming(-3, { duration: 50 }),
          withTiming(0, { duration: 50 })
        ),
        -1,
        true
      );
      shakeY.value = withRepeat(
        withSequence(
          withTiming(2, { duration: 60 }),
          withTiming(-2, { duration: 60 }),
          withTiming(0, { duration: 60 })
        ),
        -1,
        true
      );
      
      // Activate liquid trails with stagger and rotation
      liquidTrails.forEach((trail, index) => {
        const delay = index * 30;
        trail.scale.value = withDelay(delay, withSpring(1 - (index * 0.05), { damping: 15, stiffness: 200 }));
        trail.opacity.value = withDelay(delay, withTiming(0.9 - (index * 0.06), { duration: 150 }));
        trail.rotation.value = withDelay(delay, withSpring(index * 30, { damping: 20, stiffness: 150 }));
      });
      
      liquidStretch.value = withSpring(1.5, { damping: 10, stiffness: 300 });
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      cursorX.value = locationX;
      cursorY.value = locationY;
      
      // Update liquid trails with fluid, organic movement
      liquidTrails.forEach((trail, index) => {
        const delay = (index + 1) * 40;
        const elasticity = 120 - (index * 8);
        const damping = 8 + (index * 1.5);
        
        setTimeout(() => {
          trail.x.value = withSpring(locationX + Math.sin(index * 0.5) * 10, { 
            damping, 
            stiffness: elasticity 
          });
          trail.y.value = withSpring(locationY + Math.cos(index * 0.5) * 10, { 
            damping, 
            stiffness: elasticity 
          });
        }, delay);
      });
      
      // Liquid stretch and morph effect
      liquidStretch.value = withSequence(
        withTiming(2, { duration: 100 }),
        withSpring(1.2, { damping: 12, stiffness: 400 })
      );
    },
    onPanResponderRelease: () => {
      // Stop shake effect
      shakeX.value = withTiming(0, { duration: 200 });
      shakeY.value = withTiming(0, { duration: 200 });
      
      // Hide liquid trails with reverse stagger
      liquidTrails.forEach((trail, index) => {
        const delay = index * 25;
        trail.scale.value = withDelay(delay, withTiming(0, { duration: 300 }));
        trail.opacity.value = withDelay(delay, withTiming(0, { duration: 300 }));
        trail.rotation.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 200 }));
      });
      
      liquidStretch.value = withSpring(0, { damping: 15, stiffness: 200 });
      
      setTimeout(() => {
        setIsTrailActive(false);
      }, 800);
    },
  });

  const triggerRippleTransition = (touchX, touchY, callback) => {
    rippleX.value = touchX;
    rippleY.value = touchY;
    
    // Start ripple effect
    rippleScale.value = 0;
    rippleOpacity.value = 1;
    blurIntensity.value = 0;
    
    // Animate ripple expansion with blur
    rippleScale.value = withTiming(15, { duration: 1000 });
    rippleOpacity.value = withSequence(
      withTiming(0.8, { duration: 300 }),
      withTiming(0, { duration: 700 })
    );
    blurIntensity.value = withSequence(
      withTiming(25, { duration: 500 }),
      withTiming(0, { duration: 500 })
    );
    
    // Execute callback at peak blur
    setTimeout(() => {
      runOnJS(callback)();
    }, 500);
  };

  const handleHomePress = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    triggerRippleTransition(locationX, locationY, () => setShowSecondScreen(true));
  };

  const handleBackPress = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    triggerRippleTransition(locationX, locationY, () => setShowSecondScreen(false));
  };

  // Animated styles for ripple blur transition
  const rippleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: rippleX.value - 50 },
        { translateY: rippleY.value - 50 },
        { scale: rippleScale.value },
      ],
      opacity: rippleOpacity.value,
    };
  });

  const blurOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: blurIntensity.value > 0 ? 1 : 0,
    };
  });

  // Liquid gradient cursor styles
  const liquidCursorStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      liquidStretch.value,
      [0, 1, 1.5, 2],
      [0, 1, 1.3, 1.8],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [
        { translateX: cursorX.value - 30 + shakeX.value },
        { translateY: cursorY.value - 30 + shakeY.value },
        { scale },
      ],
      opacity: isTrailActive ? 1 : 0,
    };
  });

  // Individual liquid trail styles
  const getLiquidTrailStyle = (index) => {
    return useAnimatedStyle(() => {
      const trail = liquidTrails[index];
      const baseScale = 1 - (index * 0.08);
      
      return {
        transform: [
          { translateX: trail.x.value - 25 + shakeX.value * (1 - index * 0.1) },
          { translateY: trail.y.value - 25 + shakeY.value * (1 - index * 0.1) },
          { scale: trail.scale.value * baseScale },
          { rotate: `${trail.rotation.value}deg` },
        ],
        opacity: trail.opacity.value,
      };
    });
  };

  // Black and gray gradient colors for liquid trails
  const getGradientColors = (index) => {
    const grayShades = [
      ['#000000', '#333333', '#666666'],
      ['#111111', '#444444', '#777777'],
      ['#222222', '#555555', '#888888'],
      ['#000000', '#2a2a2a', '#555555'],
    ];
    return grayShades[index % grayShades.length];
  };

  // Screen shake effect for the entire container
  const screenShakeStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: shakeX.value * 2 },
        { translateY: shakeY.value * 2 },
      ],
    };
  });

  if (showSecondScreen) {
    return (
      <Animated.View style={[styles.container, screenShakeStyle]}>
        <StatusBar style="light" />
        
        {/* Background Image */}
        <Image
          source={{
            uri: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800',
          }}
          style={styles.backgroundImage}
        />
        <View style={styles.backgroundOverlay} />
        
        {/* Ripple Blur Transition */}
        <Animated.View style={[styles.blurOverlay, blurOverlayStyle]} pointerEvents="none">
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
        
        <Animated.View style={[styles.rippleEffect, rippleAnimatedStyle]} pointerEvents="none">
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(100,150,255,0.2)', 'transparent']}
            style={styles.rippleGradient}
          />
        </Animated.View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Second Screen</Text>
            <View style={styles.headerSpacer} />
          </View>
          
          {/* Content */}
          <View style={styles.secondScreenContent}>
            <Text style={styles.secondScreenTitle}>Welcome!</Text>
            <Text style={styles.secondScreenText}>
              This screen was accessed with a beautiful ripple blur transition.
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, screenShakeStyle]} {...panResponder.panHandlers}>
      <StatusBar style="light" />
      
      {/* Background Image */}
      <Image
        source={{
          uri: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800',
        }}
        style={styles.backgroundImage}
      />
      <View style={styles.backgroundOverlay} />
      
      {/* Ripple Blur Transition */}
      <Animated.View style={[styles.blurOverlay, blurOverlayStyle]} pointerEvents="none">
        <BlurView intensity={blurIntensity} tint="dark" style={StyleSheet.absoluteFill} />
      </Animated.View>
      
      <Animated.View style={[styles.rippleEffect, rippleAnimatedStyle]} pointerEvents="none">
        <LinearGradient
          colors={['rgba(255,255,255,0.3)', 'rgba(100,150,255,0.2)', 'transparent']}
          style={styles.rippleGradient}
        />
      </Animated.View>
      
      {/* Liquid Gradient Cursor Trail */}
      {isTrailActive && (
        <View style={styles.cursorContainer} pointerEvents="none">
          {/* Liquid Trail Elements */}
          {liquidTrails.map((_, index) => (
            <Animated.View key={`liquid-${index}`} style={[styles.liquidTrail, getLiquidTrailStyle(index)]}>
              <LinearGradient
                colors={getGradientColors(index)}
                style={styles.liquidGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>
          ))}
          
          {/* Main Liquid Cursor */}
          <Animated.View style={[styles.liquidCursor, liquidCursorStyle]}>
            <LinearGradient
              colors={['#000000', '#333333', '#666666', '#999999']}
              style={styles.mainLiquidGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>
        </View>
      )}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <Text style={styles.genieTitle}>Genie</Text>
          <TouchableOpacity onPress={handleHomePress} style={styles.homeButton}>
            <Home size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Sam's Notification Card */}
        <View style={styles.notificationCard}>
          <View style={styles.notificationContent}>
            <Image
              source={{
                uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
              }}
              style={styles.profileImage}
            />
            <View style={styles.notificationText}>
              <Text style={styles.notificationName}>Sam</Text>
              <Text style={styles.notificationMessage}>Shared a portal with you</Text>
            </View>
            <TouchableOpacity style={styles.replyButton}>
              <Text style={styles.replyText}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Main Content Area */}
        <View style={styles.mainContent}>
          {/* Sam Messaged Section */}
          <View style={styles.messageSection}>
            <Text style={styles.messageTitle}>Sam Messaged</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={styles.ratingText}>4.5</Text>
            </View>
            <TouchableOpacity style={styles.directionsButton}>
              <Text style={styles.directionsIcon}>🧭</Text>
              <Text style={styles.directionsText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Bottom Navigation */}
        <View style={styles.bottomNavigation}>
          <TouchableOpacity style={styles.navButton}>
            <View style={styles.navIcon}>
              <Send size={20} color="white" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <View style={styles.navIcon}>
              <MoreHorizontal size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backgroundOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  
  // Ripple Blur Transition Effects
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  rippleEffect: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    zIndex: 999,
  },
  rippleGradient: {
    flex: 1,
    borderRadius: 50,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  
  // Liquid Gradient Cursor Trail
  cursorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  liquidCursor: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  mainLiquidGradient: {
    flex: 1,
    borderRadius: 30,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  liquidTrail: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  liquidGradient: {
    flex: 1,
    borderRadius: 25,
    shadowColor: '#333333',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  
  // Top Header
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  genieTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: 'white',
    fontFamily: 'Inter-Regular',
  },
  homeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Sam's Notification Card
  notificationCard: {
    marginHorizontal: 30,
    marginBottom: 40,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    overflow: 'hidden',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  notificationText: {
    flex: 1,
  },
  notificationName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 3,
    fontFamily: 'Inter-SemiBold',
  },
  notificationMessage: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Regular',
  },
  replyButton: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  replyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter-SemiBold',
  },
  
  // Main Content
  mainContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 30,
    paddingBottom: 100,
  },
  messageSection: {
    alignItems: 'center',
  },
  messageTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: 'white',
    marginBottom: 15,
    fontFamily: 'Inter-Regular',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  starIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  ratingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Inter-SemiBold',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
  },
  directionsIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  directionsText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  
  // Bottom Navigation
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 60,
    paddingBottom: 40,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    alignItems: 'center',
  },
  navIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Second Screen
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    color: 'white',
    fontWeight: '300',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  headerSpacer: {
    width: 44,
  },
  secondScreenContent: {
    padding: 30,
    alignItems: 'center',
    marginTop: 100,
  },
  secondScreenTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  secondScreenText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
});