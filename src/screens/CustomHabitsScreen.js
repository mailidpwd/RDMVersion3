import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { GoalsService } from '../services/GoalsService';
import { UserSessionService } from '../services/UserSessionService';

export default function CustomHabitsScreen({ navigation }) {
  const [habits, setHabits] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCustomHabits();
    
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  // Refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCustomHabits();
    });
    return unsubscribe;
  }, [navigation]);

  const loadCustomHabits = async () => {
    try {
      const userGoals = await GoalsService.getUserGoals();
      
      // Get ONLY long-term habits from Quiz Hub flow (ActionPicker → GoalConfigurationScreen)
      // Exclude dashboard "Custom Habits" - those belong to AdditionalHabitsScreen
      const longTermHabits = userGoals.filter(goal => {
        // Include habits from Quiz Hub categories (Mindfulness, Purposefulness, etc.)
        const quizHubCategories = ['Mindfulness', 'Purposefulness', 'Empathy & Philanthropy', 'Empathy'];
        if (quizHubCategories.includes(goal.category)) {
          return true;
        }
        // Include Mood Assessment habits
        if (goal.category === 'Mood Assessment') {
          return true;
        }
        // EXCLUDE 'Custom Habits' category - those are for dashboard Additional Habits
        // EXCLUDE dashboard short-term habits
        return false;
      });
      
      console.log('📋 Custom Habits Screen - Loaded long-term habits:', longTermHabits.length);
      setHabits(longTermHabits);
    } catch (error) {
      console.error('Error loading custom habits:', error);
    }
  };

  const handleDeleteHabit = async (habit) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await GoalsService.deleteGoal(habit.id);
              await loadCustomHabits();
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete habit.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#20C997', '#17A085']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>RDM</Text>
          </View>
          
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="person-outline" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconButton}>
              <Ionicons name="menu" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Custom Habits Section */}
        <View style={styles.customHabitsSection}>
          <View style={styles.customHabitsHeader}>
            <Text style={styles.customHabitsTitle}>Custom Habits</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('ActionPicker', { 
                habitsWithPriority: null,
                selectedCategory: null 
              })}
            >
              <MaterialIcons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Habits List */}
          {habits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📝</Text>
              <Text style={styles.emptyStateTitle}>No Habits Yet</Text>
              <Text style={styles.emptyStateText}>
                Create your first custom habit to start your journey
              </Text>
            </View>
          ) : (
            <View style={styles.habitsList}>
              {habits.map((habit, index) => (
                <HabitBlock 
                  key={habit.id} 
                  habit={habit} 
                  index={index}
                  onDelete={() => handleDeleteHabit(habit)}
                />
              ))}
            </View>
          )}

          {/* Make your own AI custom Habit button */}
          {habits.length >= 1 && (
            <TouchableOpacity
              style={styles.aiHabitButtonWrapper}
              onPress={() => navigation.navigate('AddCustomHabit')}
            >
              <LinearGradient
                colors={['#20C997', '#17A085']}
                style={styles.aiHabitButton}
              >
                <Text style={styles.aiHabitButtonText}>
                  Make your own AI custom Habit
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

// Habit Block Component with Animation
const HabitBlock = ({ habit, index, onDelete }) => {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 80,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, index * 80);
  }, []);

  const isMoodHabit = habit.category === 'Mood Assessment';
  const habitName = isMoodHabit 
    ? (habit.description || 'Mood Habit')
    : (habit.title || habit.habitName || 'Unknown Habit');
  
  const metadata = isMoodHabit 
    ? `Frequency: ${habit.frequency || 'Daily'} • RDM: ${habit.pledgeAmount || 1}`
    : `Frequency: ${habit.activityFrequency || 'Daily'} • Reflections: ${habit.reflections || 'Everyday'} • RDM: ${habit.pledgeRdm || 1}`;

  return (
    <Animated.View
      style={[
        styles.habitBlock,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.habitBlockContent}
        onLongPress={onDelete}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#20C997', '#17A085']}
          style={styles.habitCheckIcon}
        >
          <Ionicons name="checkmark" size={16} color="#FFF" />
        </LinearGradient>
        
        <View style={styles.habitDetails}>
          <Text style={styles.habitName} numberOfLines={2}>
            {habitName}
          </Text>
          <Text style={styles.habitMeta}>{metadata}</Text>
        </View>
        
        <View style={styles.habitStatus} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  scrollView: {
    flex: 1,
  },
  customHabitsSection: {
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 100,
  },
  customHabitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  customHabitsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A202C',
    letterSpacing: -0.3,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#20C997',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  habitsList: {
    gap: 12,
  },
  habitBlock: {
    marginBottom: 4,
  },
  habitBlockContent: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    gap: 12,
  },
  habitCheckIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitDetails: {
    flex: 1,
  },
  habitName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
    lineHeight: 18,
  },
  habitMeta: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  habitStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#20C997',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  aiHabitButtonWrapper: {
    marginTop: 20,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  aiHabitButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiHabitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

