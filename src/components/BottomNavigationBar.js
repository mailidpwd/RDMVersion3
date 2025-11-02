import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Animated Icon Component with Micro-Interactions
const AnimatedIcon = ({ item, isActive, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const breathe = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  // Breathing animation for active state
  useEffect(() => {
    if (isActive) {
      const breathing = Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, {
            toValue: 1.08,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breathe, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      breathing.start();
      
      // Glow pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(glow, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();

      return () => breathing.stop();
    } else {
      breathe.setValue(1);
      glow.setValue(0);
    }
  }, [isActive]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.85,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 0.8,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
      // Celebratory spin on activation
      Animated.sequence([
        Animated.timing(rotate, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onPress();
    });
  };

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.menuItem}
    >
      <View style={styles.contentWrapper}>
        <Animated.View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isActive ? item.iconColor : item.bgColor,
              shadowColor: item.iconColor,
              transform: [
                { scale: Animated.multiply(scale, isActive ? breathe : 1) },
                { rotate: rotateInterpolate },
              ],
            },
          ]}
        >
          {isActive && (
            <Animated.View
              style={[
                styles.glowEffect,
                {
                  opacity: glowOpacity,
                  backgroundColor: item.iconColor,
                },
              ]}
            />
          )}
          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            <Ionicons
              name={item.icon}
              size={24}
              color={isActive ? '#FFFFFF' : item.iconColor}
            />
          </Animated.View>
        </Animated.View>
        <Text style={styles.menuText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function BottomNavigationBar({ navigation, currentRoute, isVisible = true }) {
  const [activeTab, setActiveTab] = useState('Goals');
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Sync active tab based on current route OR navigation state
  React.useEffect(() => {
    const updateActiveTab = () => {
      // Try to get the current route from navigation state first
      const state = navigation.getState();
      const currentRouteName = state?.routes[state.index]?.name;
      
      const routeMap = {
        'Dashboard': 'Goals',
        'Transfer': 'Transfer',
        'Donate': 'Donate',
        'MedaaAI': 'MedaaAI',
      };
      
      // Use navigation state if available, otherwise fall back to prop
      const actualRoute = currentRouteName || currentRoute || 'Dashboard';
      const tabId = routeMap[actualRoute] || 'Goals';
      setActiveTab(tabId);
    };

    // Update immediately
    updateActiveTab();

    // Listen for navigation changes
    const unsubscribe = navigation.addListener('state', () => {
      updateActiveTab();
    });

    return unsubscribe;
  }, [currentRoute, navigation]);

  // Animate visibility changes
  useEffect(() => {
    if (isVisible) {
      // Slide up and fade in with bounce
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 200,
          friction: 15,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 180,
          friction: 12,
        }),
      ]).start();
    } else {
      // Slide down with fade and slight scale
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 120,
          useNativeDriver: true,
          tension: 300,
          friction: 20,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 0.9,
          useNativeDriver: true,
          tension: 200,
          friction: 15,
        }),
      ]).start();
    }
  }, [isVisible]);

  const menuItems = [
    { 
      id: 'Goals', 
      name: 'Goals', 
      icon: 'flag',
      iconColor: '#20C997',
      bgColor: '#E6FAF5',
      route: 'Dashboard' 
    },
    { 
      id: 'Transfer', 
      name: 'Transfer', 
      icon: 'swap-horizontal',
      iconColor: '#5B9FFF',
      bgColor: '#E3F2FD',
      route: 'Transfer' 
    },
    { 
      id: 'Donate', 
      name: 'Donate', 
      icon: 'heart',
      iconColor: '#EF4444',
      bgColor: '#FEE2E2',
      route: 'Donate' 
    },
    { 
      id: 'Reflect', 
      name: 'Reflect', 
      icon: 'compass',
      iconColor: '#FFC107',
      bgColor: '#FFF9C4',
      route: 'Dashboard' 
    },
    { 
      id: 'MedaaAI', 
      name: 'Medaa.AI', 
      icon: 'hardware-chip',
      iconColor: '#8B5CF6',
      bgColor: '#F3E8FF',
      route: 'MedaaAI' 
    },
  ];

  const handleNavigation = (item) => {
    setActiveTab(item.id);
    if (navigation) {
      navigation.navigate(item.route);
    }
  };


  // Animated styles
  const animatedStyle = {
    transform: [
      { translateY: translateY },
      { scale: scale }
    ],
    opacity: opacity,
  };

  return (
    <Animated.View style={[styles.containerWrapper, animatedStyle]}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <View style={styles.glassOverlay} />
        <View style={styles.contentContainer}>
      {menuItems.map((item) => {
        const isActive = activeTab === item.id;
        
        return (
              <AnimatedIcon
            key={item.id}
                item={item}
                isActive={isActive}
            onPress={() => handleNavigation(item)}
              />
        );
      })}
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 10,
    right: 10,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 35,
  },
  blurContainer: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 28,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  menuItem: {
    alignItems: 'center',
    flex: 1,
  },
  contentWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0,
  },
  glowEffect: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    top: -4,
    left: -4,
  },
  menuText: {
    fontSize: 10,
    color: '#2D3748',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
