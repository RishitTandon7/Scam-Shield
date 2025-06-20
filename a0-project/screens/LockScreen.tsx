import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions,
  Easing 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function LockScreen() {
  const navigation = useNavigation();
  
  // Animation refs
  const lockScale = useRef(new Animated.Value(0)).current;
  const lockRotation = useRef(new Animated.Value(0)).current;
  const lockOpacity = useRef(new Animated.Value(1)).current;
  const shieldScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const particles = useRef(Array.from({ length: 12 }, () => ({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0)
  }))).current;

  useEffect(() => {
    const animationSequence = () => {
      // Background fade in
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Lock appears and grows with bounce
      Animated.sequence([
        Animated.timing(lockScale, {
          toValue: 1.2,
          duration: 600,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.timing(lockScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Lock starts spinning with pulse
        Animated.parallel([
          Animated.loop(
            Animated.timing(lockRotation, {
              toValue: 1,
              duration: 2000,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            { iterations: 2 }
          ),
          Animated.loop(
            Animated.sequence([
              Animated.timing(glowOpacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(glowOpacity, {
                toValue: 0.3,
                duration: 800,
                useNativeDriver: true,
              }),
            ]),
            { iterations: 3 }
          ),
          // Ripple effect
          Animated.loop(
            Animated.sequence([
              Animated.timing(rippleScale, {
                toValue: 2,
                duration: 1500,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(rippleScale, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
            { iterations: 2 }
          ),
        ]),
        // Particle explosion
        Animated.parallel([
          // Lock fades out
          Animated.timing(lockOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          // Particles explode
          ...particles.map((particle, index) => {
            const angle = (index / particles.length) * 2 * Math.PI;
            const distance = 150;
            return Animated.parallel([
              Animated.timing(particle.x, {
                toValue: Math.cos(angle) * distance,
                duration: 800,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(particle.y, {
                toValue: Math.sin(angle) * distance,
                duration: 800,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.timing(particle.opacity, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }),
                Animated.timing(particle.opacity, {
                  toValue: 0,
                  duration: 600,
                  useNativeDriver: true,
                }),
              ]),
              Animated.sequence([
                Animated.timing(particle.scale, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }),
                Animated.timing(particle.scale, {
                  toValue: 0,
                  duration: 600,
                  useNativeDriver: true,
                }),
              ]),
            ]);
          }),
        ]),
        // Shield appears
        Animated.timing(shieldScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        // Title appears
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Navigate after animation completes
        setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          navigation.replace('MainTabs');
        }, 1500);
      });
    };

    // Start animation after small delay
    setTimeout(animationSequence, 300);
  }, []);

  const spin = lockRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#1A1A2E', '#16213E']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: backgroundOpacity }]}>
        <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />
      </Animated.View>

      {/* Animated Background Particles */}
      <View style={styles.particleContainer}>
        {Array.from({ length: 20 }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.backgroundParticle,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: backgroundOpacity,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>
        {/* Ripple Effect */}
        <Animated.View style={[
          styles.ripple,
          {
            transform: [{ scale: rippleScale }],
            opacity: glowOpacity,
          }
        ]} />

        {/* Lock Animation */}
        <Animated.View style={[
          styles.lockContainer,
          {
            transform: [
              { scale: lockScale },
              { rotate: spin }
            ],
            opacity: lockOpacity,
          }
        ]}>
          <LinearGradient
            colors={['#00D4FF', '#0099CC']}
            style={styles.lockGradient}
          >
            <Ionicons name="lock-closed" size={60} color="white" />
          </LinearGradient>
          <Animated.View style={[
            styles.lockGlow,
            { opacity: glowOpacity }
          ]} />
        </Animated.View>

        {/* Explosion Particles */}
        {particles.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                  { scale: particle.scale }
                ],
                opacity: particle.opacity,
              }
            ]}
          />
        ))}

        {/* Shield (appears after lock) */}
        <Animated.View style={[
          styles.shieldContainer,
          {
            transform: [{ scale: shieldScale }],
          }
        ]}>
          <LinearGradient
            colors={['#00D4FF', '#FF00FF']}
            style={styles.shieldGradient}
          >
            <Ionicons name="shield-checkmark" size={80} color="white" />
          </LinearGradient>
          <View style={styles.shieldGlow} />
        </Animated.View>

        {/* Title */}
        <Animated.View style={[
          styles.titleContainer,
          { opacity: titleOpacity }
        ]}>
          <Text style={styles.title}>ScamShield</Text>
          <Text style={styles.subtitle}>AI-Powered Protection</Text>
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundParticle: {
    width: 2,
    height: 2,
    backgroundColor: '#00D4FF',
    borderRadius: 1,
    position: 'absolute',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#00D4FF',
  },
  lockContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  lockGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#00D4FF',
    opacity: 0.3,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 25,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00D4FF',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 10,
  },
  shieldContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 25,
  },
  shieldGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FF00FF',
    opacity: 0.2,
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 35,
    elevation: 30,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 200,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: '#00D4FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00D4FF',
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
});