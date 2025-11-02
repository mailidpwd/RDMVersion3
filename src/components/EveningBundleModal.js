import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { UserSessionService } from '../services/UserSessionService';
import WaterTrackingService from '../services/WaterTrackingService';

// Note: expo-notifications requires a development build and will not work in Expo Go
// For now, the reminder feature is disabled in Expo Go
// To enable: Uncomment the import below and rebuild with npx expo run:android
// import * as Notifications from 'expo-notifications';

const FAMILY_MOMENTS = [
  {
    title: "Talk 10 minutes without phones.",
    description: "Quality connection time boosts happiness and strengthens bonds.",
    emoji: "📱"
  },
  {
    title: "Spend 10 minutes together — share a laugh.",
    description: "Simple time together builds joy and meaningful memories.",
    emoji: "👨‍👩‍👧"
  },
  {
    title: "Listen without interrupting for 2 mins.",
    description: "Active listening deepens understanding and respect.",
    emoji: "👂"
  },
  {
    title: "Evening gratitude circle.",
    description: "Sharing gratitude brings families closer together.",
    emoji: "🙏"
  }
];

export default function EveningBundleModal({ visible, username, onComplete, onClose }) {
  const [step, setStep] = useState(1);
  // Show a specific family moment as requested
  const familyMoment = {
    title: 'Spend 10 minutes with your happiest family ones.',
    description: 'Sharing happy moments builds warmth and connection.',
    emoji: '👨‍👩‍👧‍👦'
  };
  const [waterAmount, setWaterAmount] = useState(0); // ml
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef(null);
  const [timer, setTimer] = useState(180); // 3 minutes in seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const timerIntervalRef = React.useRef(null);
  const DAILY_GOAL_ML = 3000; // 12 glasses (12 * 250ml)
  
  const addWater = async (amount) => {
    const newAmount = await WaterTrackingService.addWater(amount);
    setWaterAmount(newAmount);
  };
  
  const removeWater = async (amount) => {
    const newAmount = await WaterTrackingService.removeWater(amount);
    setWaterAmount(newAmount);
  };

  // Load water from shared service
  const loadWaterFromStorage = async () => {
    try {
      const ml = await WaterTrackingService.getTodayWaterIntake();
      setWaterAmount(ml);
    } catch (e) {
      console.error('Error loading water:', e);
      }
  };

  // Load when modal opens
  useEffect(() => {
    if (visible) {
    loadWaterFromStorage();
    }
  }, [visible]);

  // Reload when reaching results step
  useEffect(() => {
    if (step === 3) {
      loadWaterFromStorage();
    }
  }, [step]);

  const handleComplete = async () => {
    try {
      const userEmail = await UserSessionService.getCurrentUserEmail();
      if (userEmail) {
        const today = new Date().toDateString();
        await UserSessionService.setAsyncStorageItem(`evening_bundle_${userEmail}`, today);
      }
    } catch (error) {
      console.error('Error completing evening bundle:', error);
    }
    setStep(1);
    onComplete();
  };

  const handleVideoPress = () => {
    if (isPlaying) {
      videoRef.current?.pauseAsync();
      setIsPlaying(false);
      setTimerRunning(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    } else {
      videoRef.current?.playAsync();
      setIsPlaying(true);
      setTimerRunning(true);
      // Start timer countdown
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleRemindMeIn10Minutes = async () => {
    // Show user-friendly message that this feature requires a development build
    // When building for production with: npx expo run:android, uncomment the import above
    Alert.alert(
      'Development Build Required 🏗️',
      'Push notifications require a development build to work.\n\nThis feature will work when you build the app with:\nnpx expo run:android or npx expo run:ios',
      [{ text: 'Got it! ✅' }]
    );
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Step 1: Gentle Entry - Calm Music
  if (step === 1) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.emoji}>🌇</Text>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Evening Reset</Text>
                <View style={styles.timerBadge}>
                  <Ionicons name="time" size={14} color="#764ba2" />
                  <Text style={styles.timerText}>
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </Text>
                </View>
              </View>
              <Text style={styles.subtitle}>Let's wind down from work</Text>
            </View>

            <TouchableOpacity
              style={styles.videoContainer}
              onPress={handleVideoPress}
              activeOpacity={1}
            >
              <Video
                ref={videoRef}
                source={require('../../assets/videos/evening_calm.mp4')}
                style={styles.videoPlayer}
                useNativeControls={false}
                resizeMode="cover"
                shouldPlay={false}
                isLooping={true}
              />
              {/* Custom Play/Pause Button Overlay */}
              {!isPlaying && (
                <View style={styles.playButtonOverlay}>
                  <LinearGradient
                    colors={['rgba(118, 75, 162, 0.85)', 'rgba(240, 147, 251, 0.85)']}
                    style={styles.playButtonCircle}
                  >
                    <Ionicons name="play" size={48} color="#FFF" />
                  </LinearGradient>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.musicDescription}>🎶 Listening to calm music softens your nervous system</Text>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setStep(2)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#764ba2', '#f093fb']}
                style={styles.nextButtonGradient}
              >
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
                <Text style={styles.nextButtonText}>Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Step 2: Family / Social Nudge
  if (step === 2) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.emoji}>🎥</Text>
              <Text style={styles.title}>Family Moment</Text>
              <Text style={styles.subtitle}>Today's warm connection</Text>
            </View>

            <View style={styles.familyMomentContainer}>
              <Text style={styles.familyEmoji}>{familyMoment.emoji}</Text>
              <Text style={styles.familyTitle}>{familyMoment.title}</Text>
              <Text style={styles.familyDescription}>{familyMoment.description}</Text>
            </View>

            <View style={styles.tagFamilyContainer}>
              <Ionicons name="heart" size={24} color="#20C997" />
              <Text style={styles.tagFamilyText}>Tag one family/friend & send them an RDM token ❤️ to remind them you care</Text>
            </View>

            {/* Quick Ideas Row */}
            <View style={styles.quickIdeasRow}>
              <View style={styles.quickIdeaChip}>
                <Ionicons name="chatbubble-outline" size={16} color="#20C997" />
                <Text style={styles.quickIdeaText}>Ask "best moment today?"</Text>
              </View>
              <View style={styles.quickIdeaChip}>
                <Ionicons name="restaurant-outline" size={16} color="#20C997" />
                <Text style={styles.quickIdeaText}>Plan 10-min chai time</Text>
              </View>
              <View style={styles.quickIdeaChip}>
                <Ionicons name="musical-notes-outline" size={16} color="#20C997" />
                <Text style={styles.quickIdeaText}>Share a fav song</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.primaryAction} activeOpacity={0.85}>
                <LinearGradient colors={["#20C997", "#17A085"]} style={styles.primaryActionGradient}>
                  <Ionicons name="send" size={18} color="#FFF" />
                  <Text style={styles.primaryActionText}>Send RDM token</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.secondaryAction} 
                activeOpacity={0.85}
                onPress={handleRemindMeIn10Minutes}
              >
                <Ionicons name="alarm-outline" size={18} color="#764ba2" />
                <Text style={styles.secondaryActionText}>Remind me in 10m</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setStep(3)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#764ba2', '#f093fb']}
                style={styles.nextButtonGradient}
              >
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
                <Text style={styles.nextButtonText}>Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Step 3: Daily Review with Water
  if (step === 3) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.emoji}>🌿</Text>
              <Text style={styles.title}>Let's Review Your Day</Text>
              <Text style={styles.subtitle}>Track your progress</Text>
            </View>

            {/* Drinking Water Section */}
            <View style={styles.drinkingWaterContainer}>
              <View style={styles.drinkingWaterHeaderRow}>
                <Ionicons name="water" size={18} color="#20C997" />
                <Text style={styles.drinkingWaterTitleText}>Drinking Water</Text>
              </View>

              <View style={styles.waterHeaderRow}>
                <View style={styles.waterGlassIconBox}>
                  <View style={styles.waterGlassLiquid} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dailyGoalText}>Daily Goal: 12 glasses</Text>
                  <Text style={styles.glassCountText}>{Math.floor(waterAmount / 250)} / 12 Glasses</Text>
                </View>
              </View>

              <View style={styles.waterChip}>
                <TouchableOpacity
                  onPress={() => removeWater(250)}
                  disabled={waterAmount < 250}
                  style={[styles.waterChipIcon, waterAmount < 250 && { opacity: 0.4 }]}
                  activeOpacity={0.8}
                >
                  <Ionicons name="remove" size={18} color="#2D3748" />
                </TouchableOpacity>
                <Text style={styles.waterChipLabel}>250ml / 1 glass</Text>
                <TouchableOpacity
                  onPress={() => addWater(250)}
                  disabled={waterAmount >= DAILY_GOAL_ML}
                  style={[styles.waterChipPlus, waterAmount >= DAILY_GOAL_ML && { opacity: 0.4 }]}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={20} color="#20C997" />
                </TouchableOpacity>
              </View>

              {waterAmount >= DAILY_GOAL_ML ? (
                <View style={styles.waterCompletionSmall}>
                  <Ionicons name="checkmark-circle" size={20} color="#20C997" />
                  <Text style={styles.waterCompletionTextSmall}>Daily Goal Completed! 🎉</Text>
                </View>
              ) : (
                <Text style={styles.hydrationTip}>Stay hydrated! 💧</Text>
              )}
              <View style={styles.waterProgressBar}>
                <View style={[styles.waterProgressFill, { width: `${(waterAmount / DAILY_GOAL_ML) * 100}%` }]} />
              </View>
            </View>

            {/* Reminder Disclaimer */}
            <View style={styles.reminderDisclaimer}>
              <Ionicons name="information-circle" size={18} color="#764ba2" />
              <Text style={styles.reminderDisclaimerText}>
                Complete your habits to boost your profile and earn coins! Incomplete habits won't affect your progress positively. 📈
              </Text>
            </View>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleComplete}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#20C997', '#17A085']}
                style={styles.completeButtonGradient}
              >
                <Text style={styles.completeButtonText}>
                  Go check your remaining habits ⏰
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  containerContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#764ba2',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  videoContainer: {
    backgroundColor: '#000',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#20C997',
    height: 300,
    overflow: 'hidden',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButtonCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  musicDescription: {
    fontSize: 13,
    color: '#4A5568',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  familyMomentContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#C6F6D5',
    alignItems: 'center',
  },
  familyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  familyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 12,
  },
  familyDescription: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
  tagFamilyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  tagFamilyText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  quickIdeasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
    justifyContent: 'center',
  },
  quickIdeaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6FCF5',
    borderColor: '#C6F6D5',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickIdeaText: {
    fontSize: 12,
    color: '#2D3748',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  primaryAction: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  primaryActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryAction: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    flexDirection: 'row',
    gap: 8,
  },
  secondaryActionText: {
    color: '#764ba2',
    fontSize: 14,
    fontWeight: '700',
  },
  // Drinking Water Styles
  drinkingWaterContainer: {
    backgroundColor: '#E6FCF5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#81E6D9',
    marginBottom: 16,
  },
  drinkingWaterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  drinkingWaterTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A202C',
  },
  waterHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  waterGlassIconBox: { width: 34, height: 44, borderRadius: 6, borderWidth: 2, borderColor: '#20C997', backgroundColor: '#FFFFFF', overflow: 'hidden', justifyContent: 'flex-end' },
  waterGlassLiquid: { height: 22, backgroundColor: '#C6F6D5' },
  dailyGoalText: { fontSize: 12, color: '#718096' },
  glassCountText: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  waterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#C6F6D5', paddingVertical: 8, paddingHorizontal: 12, marginTop: 8, gap: 10, alignSelf: 'flex-start' },
  waterChipIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#EDF2F7', alignItems: 'center', justifyContent: 'center' },
  waterChipPlus: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E6FCF5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#A7F3D0' },
  waterChipLabel: { fontSize: 14, fontWeight: '600', color: '#2D3748', paddingHorizontal: 4 },
  hydrationTip: { marginTop: 6, fontSize: 12, color: '#20C997', fontWeight: '600' },
  waterProgressBar: { width: '100%', height: 6, backgroundColor: '#C6F6D5', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  waterProgressFill: { height: '100%', backgroundColor: '#20C997', borderRadius: 3 },
  waterCompletionSmall: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  waterCompletionTextSmall: { fontSize: 11, fontWeight: '600', color: '#20C997' },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  completeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  completeButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  reminderDisclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  reminderDisclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#764ba2',
    lineHeight: 18,
    fontWeight: '500',
  },
});
