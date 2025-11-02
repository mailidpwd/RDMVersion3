import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import FruitNinjaGame from './Games/FruitNinjaGame';
import Game2048 from './Games/Game2048';
import TicTacToeGame from './Games/TicTacToeGame';
import { UserSessionService } from '../services/UserSessionService';
import WaterTrackingService from '../services/WaterTrackingService';

const MOTIVATION_QUOTES = [
  "Every afternoon is a fresh start, filled with new possibilities! 🌅",
  "Your potential is limitless—keep pushing forward! 💪",
  "Small steps in the afternoon lead to giant leaps tomorrow! 🚀",
  "Embrace the energy of the day and make it count! ✨",
  "Great things happen when you don't give up! 🌟",
];

export default function AfternoonBundleModal({ visible, username, onComplete, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedGame, setSelectedGame] = useState(null);
  const [randomQuote] = useState(() => MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)]);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef(null);
  // Water tracking using shared service
  const [waterAmount, setWaterAmount] = useState(0); // ml
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
    if (step === 5) {
      loadWaterFromStorage();
    }
  }, [step]);

  // Handle modal completion
  const handleComplete = () => {
    setStep(1);
    setSelectedGame(null);
    onComplete();
  };

  // Handle video play/pause
  const handleVideoPress = () => {
    if (isPlaying) {
      videoRef.current?.pauseAsync();
      setIsPlaying(false);
    } else {
      videoRef.current?.playAsync();
      setIsPlaying(true);
    }
  };

  // Step 1: Joke
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
              <Text style={styles.emoji}>😄</Text>
              <Text style={styles.title}>Afternoon Fun!</Text>
              <Text style={styles.subtitle}>Let's start your afternoon with a smile</Text>
            </View>

            <View style={styles.jokeContainer}>
              <Text style={styles.jokeText}>
                "Why did the calendar look so popular?"
              </Text>
              <Text style={styles.jokeAnswer}>
                "It had a lot of dates." 😄
              </Text>
            </View>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setStep(2)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
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

  // Step 2: Game Selection
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
              <Text style={styles.emoji}>🎮</Text>
              <Text style={styles.title}>Choose Your Game</Text>
              <Text style={styles.subtitle}>Pick a game to refresh your mind</Text>
            </View>

            <View style={styles.gamesContainer}>
              <TouchableOpacity
                style={[styles.gameCard, selectedGame === 'fruit' && styles.gameCardSelected]}
                onPress={() => {
                  setSelectedGame('fruit');
                  setTimeout(() => setStep(3), 300);
                }}
                activeOpacity={0.7}
              >
                {selectedGame === 'fruit' && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#667eea" />
                  </View>
                )}
                <LinearGradient
                  colors={selectedGame === 'fruit' ? ['#FFF0F0', '#FFF5F0'] : ['#F8F9FA', '#F8F9FA']}
                  style={styles.gameCardGradient}
                >
                  <View style={styles.gameIconContainer}>
                    <View style={styles.gameIconBackground}>
                      <Text style={styles.gameEmoji}>🍎</Text>
                    </View>
                  </View>
                  <Text style={styles.gameTitle}>Rocket Ninja</Text>
                  <Text style={styles.gameDescription}>
                    Slice fruits, avoid bombs
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.gameCard, selectedGame === '2048' && styles.gameCardSelected]}
                onPress={() => {
                  setSelectedGame('2048');
                  setTimeout(() => setStep(3), 300);
                }}
                activeOpacity={0.7}
              >
                {selectedGame === '2048' && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#667eea" />
                  </View>
                )}
                <LinearGradient
                  colors={selectedGame === '2048' ? ['#F0F8FF', '#F0FDF4'] : ['#F8F9FA', '#F8F9FA']}
                  style={styles.gameCardGradient}
                >
                  <View style={styles.gameIconContainer}>
                    <View style={styles.gameIconBackground}>
                      <Text style={styles.gameEmoji}>🔢</Text>
                    </View>
                  </View>
                  <Text style={styles.gameTitle}>2048</Text>
                  <Text style={styles.gameDescription}>
                    Slide and merge tiles
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.gameCard, selectedGame === 'tictactoe' && styles.gameCardSelected]}
                onPress={() => {
                  setSelectedGame('tictactoe');
                  setTimeout(() => setStep(3), 300);
                }}
                activeOpacity={0.7}
              >
                {selectedGame === 'tictactoe' && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#667eea" />
                  </View>
                )}
                <LinearGradient
                  colors={selectedGame === 'tictactoe' ? ['#FEF2F2', '#FFF5F0'] : ['#F8F9FA', '#F8F9FA']}
                  style={styles.gameCardGradient}
                >
                  <View style={styles.gameIconContainer}>
                    <View style={styles.gameIconBackground}>
                      <Text style={styles.gameEmoji}>❌</Text>
                    </View>
                  </View>
                  <Text style={styles.gameTitle}>Tic Tac Toe</Text>
                  <Text style={styles.gameDescription}>
                    Play against computer
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Skip Option */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => setStep(4)}
              activeOpacity={0.8}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Step 3: Game Experience
  if (step === 3) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <ScrollView 
            style={styles.gameContainer} 
            contentContainerStyle={styles.gameContainerContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.gameHeader}>
              <Text style={styles.emoji}>🎮</Text>
              <Text style={styles.title}>
                {selectedGame === 'fruit' && 'Rocket Ninja'}
                {selectedGame === '2048' && '2048'}
                {selectedGame === 'tictactoe' && 'Tic Tac Toe'}
              </Text>
            </View>

            {/* Render the actual game component */}
            {selectedGame === 'fruit' && (
              <FruitNinjaGame onGameComplete={(result) => setStep(4)} />
            )}
            {selectedGame === '2048' && (
              <Game2048 onGameComplete={(result) => setStep(4)} />
            )}
            {selectedGame === 'tictactoe' && (
              <TicTacToeGame onGameComplete={(result) => setStep(4)} />
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  }

  // Step 4: Motivation Quote & Video
  if (step === 4) {
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
              <Text style={styles.emoji}>✨</Text>
              <Text style={styles.title}>Afternoon Motivation</Text>
              <Text style={styles.subtitle}>Keep that energy going!</Text>
            </View>

            <View style={styles.quoteContainer}>
              <Text style={styles.quote}>{randomQuote}</Text>
            </View>

            <TouchableOpacity
              style={styles.videoContainer}
              onPress={handleVideoPress}
              activeOpacity={1}
            >
              <Video
                ref={videoRef}
                source={require('../../assets/videos/motivation.mp4')}
                style={styles.videoPlayer}
                useNativeControls={false}
                resizeMode="cover"
                shouldPlay={false}
                isLooping={true}
              />
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

            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => setStep(5)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#20C997', '#17A085']}
                style={styles.completeButtonGradient}
              >
                <Text style={styles.completeButtonText}>
                  Feeling energized! 💪
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Step 5: Afternoon Results (Drinking Water + Go to Habits)
  if (step === 5) {
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
              <Text style={styles.emoji}>🌤️</Text>
              <Text style={styles.title}>Review Afternoon Habits</Text>
              <Text style={styles.subtitle}>Hydrate and keep moving</Text>
            </View>

            <View style={styles.drinkingWaterContainer}>
              <View style={styles.drinkingWaterHeaderRow}>
                <Ionicons name="water" size={18} color="#20C997" />
                <Text style={styles.drinkingWaterTitleText}>Drinking Water</Text>
              </View>

              {/* Header with glass illustration and goal/count */}
              <View style={styles.waterHeaderRow}>
                <View style={styles.waterGlassIconBox}>
                  <View style={styles.waterGlassLiquid} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dailyGoalText}>Daily Goal: 12 glasses</Text>
                  <Text style={styles.glassCountText}>{Math.floor(waterAmount/250)} / 12 Glasses</Text>
                </View>
              </View>

              {/* Compact chip control */}
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
                <View style={[styles.waterProgressFill, { width: `${(waterAmount/DAILY_GOAL_ML)*100}%` }]} />
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
              style={styles.goToHabitsButton}
              onPress={handleComplete}
              activeOpacity={0.9}
            >
              <LinearGradient colors={['#20C997', '#17A085']} style={styles.goToHabitsGradient}>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
                <Text style={styles.goToHabitsText}>Go check your remaining habits ⏰</Text>
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  gamesScrollContainer: {
    flexGrow: 0,
    flexShrink: 1,
  },
  gamesScrollContent: {
    gap: 14,
    paddingBottom: 10,
  },
  gameContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: '95%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  gameContainerContent: {
    padding: 10,
    paddingBottom: 20,
  },
  gameHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  containerContent: {
    paddingBottom: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
  },
  jokeContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#C6F6D5',
  },
  jokeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  jokeAnswer: {
    fontSize: 15,
    color: '#20C997',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  gamesContainer: {
    gap: 14,
    marginBottom: 24,
  },
  gameCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  gameCardSelected: {
    borderColor: '#667eea',
    borderWidth: 3,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 15,
  },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 2,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  gameCardGradient: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 18,
  },
  gameIconContainer: {
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameIconBackground: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gameEmoji: {
    fontSize: 36,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
  },
  gameDescription: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
  },
  gamePlaceholder: {
    alignItems: 'center',
    marginBottom: 24,
  },
  gameScreen: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  gamePlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#718096',
    marginTop: 16,
  },
  gamePlaceholderSubtext: {
    fontSize: 14,
    color: '#A0AEC0',
    marginTop: 8,
    fontStyle: 'italic',
  },
  quoteContainer: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 24,
  },
  videoContainer: {
    backgroundColor: '#000',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#20C997',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
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
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  nextButtonDisabled: {
    opacity: 0.5,
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
  // Afternoon results styles (borrowed from morning)
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
  reminderDisclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#F3E8FF', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E9D5FF' },
  reminderDisclaimerText: { flex: 1, fontSize: 12, color: '#764ba2', lineHeight: 18, fontWeight: '500' },
  goToHabitsButton: { borderRadius: 12, overflow: 'hidden', shadowColor: '#20C997', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  goToHabitsGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  goToHabitsText: { fontSize: 15, fontWeight: 'bold', color: '#FFF' },
  skipButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    marginTop: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});

