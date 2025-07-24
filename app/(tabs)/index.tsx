import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  SharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  Chrome as Home,
  Send,
  MoveHorizontal as MoreHorizontal,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Component for the Wavy Orb Effect ---
interface OrbProps {
  x: SharedValue<number>;
  y: SharedValue<number>;
  scaleX: SharedValue<number>;
  scaleY: SharedValue<number>;
  active: SharedValue<boolean>;
  touchX: SharedValue<number>;
}

const Orb: React.FC<OrbProps> = ({ x, y, scaleX, scaleY, active, touchX }) => {
  const style = useAnimatedStyle(() => {
    const scale = withSpring(active.value ? 1 : 0, {
      damping: 12,
      stiffness: 80,
      mass: 1.2,
    });

    return {
      position: 'absolute',
      width: 300,
      height: 300,
      borderRadius: 150,
      left: x.value - 150,
      top: y.value - 150,
      transform: [{ scale }],
      overflow: 'hidden',
      zIndex: 99, // Increased to show above most UI elements
    };
  });

  const imageStyle = useAnimatedStyle(() => {
    const velocityScale = Math.max(1, Math.abs(x.value - touchX.value) * 0.015);
    return {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      transform: [
        { translateX: -x.value + 150 },
        { translateY: -y.value + 150 },
        { scale: 2.8 * velocityScale },
        { rotateZ: `${velocityScale * 2}deg` },
      ],
    };
  });

  return (
    <Animated.View style={style}>
      <BlurView
        intensity={65} // Reduced intensity to better see UI elements
        tint="default"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 150,
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.05)', // More transparent
          },
        ]}
      >
        {/* Background image with reduced opacity */}
        <Animated.Image
          source={{
            uri: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg',
          }}
          style={[imageStyle, { opacity: 0.3 }]} // Reduced opacity to show UI better
          resizeMode="cover"
        />

        {/* UI capture layer */}
        <View style={[StyleSheet.absoluteFill, { opacity: 1 }]} />

        {/* Glass effect overlay */}
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255,255,255,0.1)',
            'rgba(255,255,255,0.15)',
          ]}
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: 150,
              transform: [{ scale: 0.9 }],
              opacity: 0.4,
            },
          ]}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 0.7, y: 0.7 }}
        />
      </BlurView>

      {/* Edge blur with reduced intensity */}
      <BlurView
        intensity={25}
        tint="default"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 150,
            opacity: 0.3,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.15)',
          },
        ]}
      />
    </Animated.View>
  );
};

// --- Main Home Screen Component ---
export default function HomeScreen() {
  const [showSecondScreen, setShowSecondScreen] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const touchX = useSharedValue(SCREEN_WIDTH / 2);
  const touchY = useSharedValue(SCREEN_HEIGHT / 2);
  const isTouching = useSharedValue(false);
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);
  const [backgroundState, setBackgroundState] = useState('first'); // Add this state
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

  // Add this function to handle background change
  const handleLongPress = () => {
    setBackgroundState('second');
  };

  // Shared values for the new slideshow transition
  const ripple = useSharedValue({ x: 0, y: 0, scale: 0 });
  const contentOpacity = useSharedValue(1);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt: GestureResponderEvent) => {
      const { locationX, locationY } = evt.nativeEvent;
      touchX.value = locationX;
      touchY.value = locationY;
      isTouching.value = true;

      // Start long press timer
      longPressTimeout.current = setTimeout(handleLongPress, 500); // 500ms for long press
    },
    onPanResponderMove: (evt: GestureResponderEvent) => {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
      }
      touchX.value = withSpring(evt.nativeEvent.locationX, {
        mass: 0.1,
        damping: 15,
        stiffness: 200,
        overshootClamping: true,
      });
      touchY.value = withSpring(evt.nativeEvent.locationY, {
        mass: 0.1,
        damping: 15,
        stiffness: 200,
        overshootClamping: true,
      });
    },
    onPanResponderRelease: () => {
      // Clear timeout on release
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
      }
      isTouching.value = false;

      // Transition to second screen without black screen
      contentOpacity.value = withTiming(
        0,
        {
          duration: 800,
        },
        () => {
          runOnJS(setShowSecondScreen)(true);
        }
      );
    },
  });

  const rippleStyle = useAnimatedStyle(() => {
    const { x, y, scale } = ripple.value;
    return {
      position: 'absolute',
      width: SCREEN_WIDTH * 2.5,
      height: SCREEN_WIDTH * 2.5,
      borderRadius: SCREEN_WIDTH * 1.25,
      left: x - SCREEN_WIDTH * 1.25,
      top: y - SCREEN_WIDTH * 1.25,
      backgroundColor: 'transparent', // Changed from 'black' to 'transparent'
      transform: [{ scale }],
    };
  });

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const handleBackPress = () => {
    setShowSecondScreen(false);
    setBackgroundState('first'); // Reset background on back press
    contentOpacity.value = withTiming(1, {
      duration: 2000,
    });
  };

  const backgroundImageUri = isPressed
    ? 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    : 'https://images.pexels.com/photos/933054/pexels-photo-933054.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

  if (showSecondScreen) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Animated.Image
          source={{
            uri: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg',
          }}
          style={[
            styles.backgroundImage,
            {
              opacity: withSpring(1),
            },
          ]}
        />

        {/* Back button moved up */}
        <TouchableOpacity
          style={[styles.backButton, { top: 40 }]}
          onPress={handleBackPress}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Genie header */}
        <View style={styles.topHeader}>
          <Text style={styles.genieTitle}>Genie</Text>
          <TouchableOpacity>
            <Home size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Sam name bar */}
        <View style={styles.cardContainer}>
          <BlurView intensity={30} tint="dark" style={styles.cardBlur}>
            <View style={styles.notificationContent}>
              <Image
                source={{
                  uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
                }}
                style={styles.profileImage}
              />
              <View style={styles.notificationText}>
                <Text style={styles.notificationName}>Sam</Text>
                <Text style={styles.notificationMessage}>
                  Shared a portal with you
                </Text>
              </View>
              <TouchableOpacity style={styles.replyButton}>
                <Text style={styles.replyText}>Reply</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>

        {/* Bottom navigation */}
        <View style={styles.bottomNavContainer}>
          <BlurView intensity={30} tint="dark" style={styles.bottomNavBlur}>
            <TouchableOpacity style={styles.navButton}>
              <Send size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton}>
              <MoreHorizontal size={24} color="white" />
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar style="light" />
      <Animated.Image
        source={{
          uri:
            backgroundState === 'first'
              ? 'https://images.pexels.com/photos/933054/pexels-photo-933054.jpeg'
              : 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg',
        }}
        style={[styles.backgroundImage]}
      />

      {/* Multiple orbs for trail effect */}
      {[...Array(3)].map((_, index) => (
        <Orb
          key={index}
          x={touchX}
          y={touchY}
          scaleX={scaleX}
          scaleY={scaleY}
          active={isTouching}
          touchX={touchX}
        />
      ))}

      <Animated.View style={[StyleSheet.absoluteFill, contentStyle]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topHeader}>
            <Text style={styles.genieTitle}>Genie</Text>
            <TouchableOpacity>
              <Home size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.cardContainer}>
            <BlurView intensity={30} tint="dark" style={styles.cardBlur}>
              <View style={styles.notificationContent}>
                <Image
                  source={{
                    uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
                  }}
                  style={styles.profileImage}
                />
                <View style={styles.notificationText}>
                  <Text style={styles.notificationName}>Sam</Text>
                  <Text style={styles.notificationMessage}>
                    Shared a portal with you
                  </Text>
                </View>
                <TouchableOpacity style={styles.replyButton}>
                  <Text style={styles.replyText}>Reply</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
          <View style={styles.mainContent}>
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
        </ScrollView>
        <View style={styles.bottomNavContainer}>
          <BlurView intensity={30} tint="dark" style={styles.bottomNavBlur}>
            <TouchableOpacity style={styles.navButton}>
              <Send size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton}>
              <MoreHorizontal size={24} color="white" />
            </TouchableOpacity>
          </BlurView>
        </View>
      </Animated.View>

      <Animated.View
        style={[styles.rippleOverlay, rippleStyle]}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    zIndex: 99,
  },
  genieTitle: {
    fontSize: 32,
    color: 'white',
    fontWeight: '300',
  },
  cardContainer: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    zIndex: 98, // Ensure it appears above other elements
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Added slight background
  },
  cardBlur: {
    padding: 20,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  notificationMessage: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  replyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  replyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: Dimensions.get('window').height * 0.35,
    paddingBottom: 150,
  },
  messageTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: 'white',
    marginBottom: 15,
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
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    zIndex: 99, // Ensure it appears above other elements
  },
  directionsIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  directionsText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 40,
    left: 60,
    right: 60,
    borderRadius: 30,
    overflow: 'hidden',
    zIndex: 98,
  },
  bottomNavBlur: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.3)', // Added slight background
  },
  navButton: {
    padding: 10,
  },
  orbGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 175,
  },
  rippleOverlay: {
    zIndex: 9999,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 100,
    padding: 10,
  },
  backText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
  },
});
