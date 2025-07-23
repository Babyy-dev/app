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
}

const Orb: React.FC<OrbProps> = ({ x, y, scaleX, scaleY, active }) => {
  const style = useAnimatedStyle(() => {
    const scale = withSpring(active.value ? 1 : 0, {
      damping: 15,
      stiffness: 120,
    });
    return {
      position: 'absolute',
      width: 350,
      height: 350,
      borderRadius: 175,
      left: x.value - 175,
      top: y.value - 175,
      transform: [
        { scaleX: scaleX.value },
        { scaleY: scaleY.value },
        { scale },
      ],
      overflow: 'hidden',
    };
  });

  return (
    <Animated.View style={style}>
      <BlurView intensity={70} style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.4)',
            'rgba(150,150,150,0.2)',
            'rgba(50,50,50,0.4)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.orbGradient}
        />
      </BlurView>
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
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Shared values for the new slideshow transition
  const ripple = useSharedValue({ x: 0, y: 0, scale: 0 });
  const contentOpacity = useSharedValue(1);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt: GestureResponderEvent) => {
      runOnJS(setIsPressed)(true);
      isTouching.value = true;
      const { locationX, locationY, pageX, pageY } = evt.nativeEvent;
      touchX.value = locationX;
      touchY.value = locationY;

      longPressTimeout.current = setTimeout(() => {
        // Start the slideshow effect: fade out content and expand ripple
        contentOpacity.value = withTiming(0, { duration: 600 });
        ripple.value = { x: pageX, y: pageY, scale: 0 };
        // Slower ripple duration for a more graceful effect
        ripple.value.scale = withTiming(1, { duration: 1200 }, () => {
          runOnJS(setShowSecondScreen)(true);
        });
      }, 800); // Slightly longer delay for the long press
    },
    onPanResponderMove: (
      evt: GestureResponderEvent,
      gestureState: PanResponderGestureState
    ) => {
      if (longPressTimeout.current) clearTimeout(longPressTimeout.current);

      touchX.value = withSpring(evt.nativeEvent.locationX, {
        mass: 0.6,
        damping: 20,
        stiffness: 150,
      });
      touchY.value = withSpring(evt.nativeEvent.locationY, {
        mass: 0.6,
        damping: 20,
        stiffness: 150,
      });

      const velocityScale = 0.2;
      const stretchX = Math.abs(gestureState.vx) * velocityScale;
      const stretchY = Math.abs(gestureState.vy) * velocityScale;

      const newScaleX = Math.max(0.8, Math.min(1 + stretchX - stretchY, 1.4));
      const newScaleY = Math.max(0.8, Math.min(1 + stretchY - stretchX, 1.4));

      scaleX.value = withSpring(newScaleX, { damping: 10, stiffness: 100 });
      scaleY.value = withSpring(newScaleY, { damping: 10, stiffness: 100 });
    },
    onPanResponderRelease: () => {
      runOnJS(setIsPressed)(false);
      if (longPressTimeout.current) clearTimeout(longPressTimeout.current);

      isTouching.value = false;
      scaleX.value = withSpring(1, { damping: 10, stiffness: 100 });
      scaleY.value = withSpring(1, { damping: 10, stiffness: 100 });
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
      backgroundColor: 'black',
      transform: [{ scale }],
    };
  });

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const handleBackPress = () => {
    setShowSecondScreen(false);
    // Reset animations for the next transition
    contentOpacity.value = withTiming(1, { duration: 600 });
    ripple.value = { ...ripple.value, scale: 0 };
  };

  const backgroundImageUri = isPressed
    ? 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    : 'https://images.pexels.com/photos/933054/pexels-photo-933054.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

  if (showSecondScreen) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Image
          source={{
            uri: 'https://images.pexels.com/photos/1528660/pexels-photo-1528660.jpeg',
          }}
          style={styles.backgroundImage}
        />
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar style="light" />
      <Image
        source={{ uri: backgroundImageUri }}
        style={styles.backgroundImage}
      />

      <Orb
        x={touchX}
        y={touchY}
        scaleX={scaleX}
        scaleY={scaleY}
        active={isTouching}
      />

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
  },
  bottomNavBlur: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
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
    zIndex: 10,
  },
  backText: {
    fontSize: 18,
    color: 'white',
  },
});
