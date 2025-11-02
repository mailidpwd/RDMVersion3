import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GoalsService } from '../services/GoalsService';
import { GeminiService } from '../services/GeminiService';
import MoodAssessmentService from '../services/MoodAssessmentService';
import MoodCustomHabitModal from './MoodCustomHabitModal';

// Simple UUID generator for React Native
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function MoodHabitRecommendationsModal({ 
  visible, 
  onClose, 
  moodData, 
  assessmentResults,
  navigation 
}) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [calculatedAssessment, setCalculatedAssessment] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const moodCardOpacity = useRef(new Animated.Value(0)).current;
  const moodCardTranslateY = useRef(new Animated.Value(30)).current;
  const actionCardOpacity = useRef(new Animated.Value(0)).current;
  const actionCardScale = useRef(new Animated.Value(0.9)).current;
  const emojiScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log('=== MODAL PROPS RECEIVED ===');
    console.log('visible:', visible);
    console.log('moodData:', moodData);
    console.log('assessmentResults:', assessmentResults);
    
    // Use moodKey from assessmentResults instead of moodData.key
    const moodKey = assessmentResults?.moodKey || moodData?.key;
    
    if (assessmentResults && assessmentResults.answers && moodKey && assessmentResults.answers.length > 0) {
      console.log('=== STARTING CALCULATION ===');
      console.log('Using moodKey:', moodKey);
      console.log('assessmentResults.answers:', assessmentResults.answers);
      console.log('assessmentResults.answers length:', assessmentResults.answers.length);
      console.log('assessmentResults.answers type:', typeof assessmentResults.answers);
      
      const assessment = MoodAssessmentService.calculateMoodAssessment(
        moodKey,
        assessmentResults.answers
      );
      
      console.log('Final assessment result:', assessment);
      setCalculatedAssessment(assessment);
    } else {
      console.log('=== CALCULATION SKIPPED ===');
      console.log('assessmentResults:', assessmentResults);
      console.log('moodData:', moodData);
      console.log('moodKey:', moodKey);
      console.log('assessmentResults?.answers:', assessmentResults?.answers);
      console.log('assessmentResults?.answers?.length:', assessmentResults?.answers?.length);
    }
  }, [assessmentResults, moodData]);

  // Entrance animation
  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      slideAnim.setValue(50);
      moodCardOpacity.setValue(0);
      moodCardTranslateY.setValue(30);
      actionCardOpacity.setValue(0);
      actionCardScale.setValue(0.9);
      emojiScale.setValue(0);

      // Start entrance animations
      Animated.parallel([
        // Modal entrance
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      // Staggered card animations
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(moodCardOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(moodCardTranslateY, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      }, 200);

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(actionCardOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(actionCardScale, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      }, 400);

      // Emoji bounce
      setTimeout(() => {
        Animated.spring(emojiScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }, 300);

      // Continuous pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible]);

  const moodStrength = calculatedAssessment?.moodIndex || 0;
  const recommendedHabit = calculatedAssessment?.recommendedHabit;
  const message = calculatedAssessment?.message;
  
  console.log('=== RENDERING STATE ===');
  console.log('moodStrength:', moodStrength);
  console.log('recommendedHabit:', recommendedHabit);
  console.log('message:', message);
  console.log('calculatedAssessment exists:', !!calculatedAssessment);

  const addHabitToDashboard = async () => {
    if (!recommendedHabit) {
      console.error('❌ No recommended habit available!');
      Alert.alert('Error', 'No habit recommendation available. Please try again.');
      return;
    }

    setIsAdding(true);
    try {
      console.log('📝 Adding habit to dashboard...');
      console.log('   Recommended habit:', recommendedHabit);
      console.log('   Mood data:', moodData);
      
      const goal = {
        id: generateId(),
        title: recommendedHabit.title || 'Untitled Habit',
        description: recommendedHabit.description || '',
        category: 'Mood Assessment', // CRITICAL: Use exact string for filtering
        subcategory: recommendedHabit.type || 'Unknown',
        frequency: 'Daily',
        reflection: 'Everyday',
        pledgeAmount: 1,
        targetDate: new Date(), // Set target date to today for daily filtering
        createdAt: new Date(),
      };

      console.log('   Goal object:', goal);
      
      await GoalsService.addGoal(goal);
      console.log('✅ Habit saved successfully');

      Alert.alert('Success', '✅ Habit added successfully!', [
        { text: 'OK', onPress: () => {
          onClose();
          // Force dashboard refresh
          if (navigation) {
            navigation.navigate('Dashboard');
          }
        }}
      ]);
    } catch (error) {
      console.error('❌ Error adding habit:', error);
      Alert.alert('Error', `Failed to add habit: ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const animatedModalStyle = {
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
  };

  const animatedMoodCardStyle = {
    opacity: moodCardOpacity,
    transform: [{ translateY: moodCardTranslateY }],
  };

  const animatedActionCardStyle = {
    opacity: actionCardOpacity,
    transform: [{ scale: actionCardScale }],
  };

  const animatedEmojiStyle = {
    transform: [{ scale: emojiScale }],
  };

  const animatedPulseStyle = {
    transform: [{ scale: pulseAnim }],
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={26} color="#4B5563" />
              </TouchableOpacity>
              <Animated.View style={animatedPulseStyle}>
                <Text style={styles.moodEmojiHeader}>{moodData?.emoji}</Text>
              </Animated.View>
              <Text style={styles.headerTitle}>Your Personalized Habits</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {/* LOVING Card */}
              <Animated.View style={[styles.moodCard, animatedMoodCardStyle]}>
                <View style={styles.moodCardHeader}>
                  <Animated.View style={animatedEmojiStyle}>
                    <Text style={styles.moodEmojiLarge}>{moodData?.emoji}</Text>
                  </Animated.View>
                  <View style={styles.moodCardText}>
                    <Text style={styles.moodCardTitle}>{moodData?.name?.toUpperCase()}</Text>
                  </View>
                </View>

                {/* Mood Strength Card */}
                <View style={styles.strengthCard}>
                  <Text style={styles.strengthText}>Mood Strength: {moodStrength}/100</Text>
                </View>

                {/* Recommendation Card */}
                <View style={styles.recommendationCard}>
                  <View style={styles.recommendationIcon}>
                    <Ionicons name="bulb" size={22} color="#20C997" />
                  </View>
                  <Text style={styles.recommendationText}>
                    {message || 'Ground yourself gently — your system needs immediate calm.'}
                  </Text>
                </View>
              </Animated.View>

              {/* Recommended Action Card */}
              {recommendedHabit && (
                <Animated.View style={[styles.actionCard, animatedActionCardStyle]}>
                  <View style={styles.actionIcon}>
                    <Ionicons name="leaf" size={26} color="#20C997" />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionLabel}>Recommended Action</Text>
                    <Text style={styles.actionType}>{recommendedHabit.type}</Text>
                    <Text style={styles.actionTitle}>{recommendedHabit.title}</Text>
                    <Text style={styles.actionInstruction}>{recommendedHabit.description}</Text>
                  </View>
                </Animated.View>
              )}
            </ScrollView>

            {/* Dynamic Action Buttons */}
            {recommendedHabit && calculatedAssessment && (
              <View style={styles.actionButtonsContainer}>
                {(() => {
                  const actionButtons = MoodAssessmentService.getActionButtons(
                    moodData?.key,
                    calculatedAssessment.moodIndex
                  );
                  return (
                    <>
                      <TouchableOpacity 
                        style={styles.actionButtonLeft}
                        activeOpacity={0.85}
                        onPress={() => {
                          // Handle left action button press
                          console.log('Left button pressed:', actionButtons.left);
                        }}
                      >
                        <View style={styles.iconWrapper}>
                          <Ionicons name="heart" size={20} color="#10B981" />
                        </View>
                        <Text style={styles.actionButtonText}>{actionButtons.left}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButtonRight}
                        activeOpacity={0.85}
                        onPress={() => {
                          // Handle right action button press
                          console.log('Right button pressed:', actionButtons.right);
                        }}
                      >
                        <View style={styles.iconWrapper}>
                          <Ionicons name="gift" size={20} color="#F59E0B" />
                        </View>
                        <Text style={styles.actionButtonText}>{actionButtons.right}</Text>
                      </TouchableOpacity>
                    </>
                  );
                })()}
              </View>
            )}

            {/* Footer Buttons */}
            <View style={styles.footer}>
              {recommendedHabit && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addHabitToDashboard}
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="add-circle" size={20} color="#FFF" />
                      <Text style={styles.addButtonText}>Add to My Habits</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.customButton}
                onPress={() => setShowCustomModal(true)}
              >
                <Ionicons name="checkbox" size={20} color="#20C997" />
                <Text style={styles.customButtonText}>Add Custom Habit</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Custom Habit Modal */}
      <MoodCustomHabitModal
        visible={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        moodEmoji={moodData?.emoji}
        moodName={moodData?.name}
        moodKey={moodData?.key}
        navigation={navigation}
        parentModalClose={onClose}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    height: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F0FDF4',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  moodEmojiHeader: {
    fontSize: 28,
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingBottom: 12,
  },
  moodCard: {
    backgroundColor: '#F0FDF4',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  moodCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  moodEmojiLarge: {
    fontSize: 32,
    marginRight: 12,
  },
  moodCardText: {
    flex: 1,
  },
  moodCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  strengthCard: {
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#20C997',
    marginBottom: 10,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#20C997',
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recommendationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  actionType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#20C997',
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  actionInstruction: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 22,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 10,
    gap: 8,
  },
  actionButtonLeft: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#10B981',
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonRight: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#F59E0B',
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrapper: {
    marginTop: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'left',
    lineHeight: 16,
    letterSpacing: -0.1,
    flex: 1,
  },
  footer: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#20C997',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#20C997',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  customButtonText: {
    color: '#20C997',
    fontSize: 16,
    fontWeight: '600',
  },
});
