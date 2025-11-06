import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import MoodAssessmentService from '../services/MoodAssessmentService';
import { GoalsService } from '../services/GoalsService';
import { UserSessionService } from '../services/UserSessionService';
import WaterTrackingService from '../services/WaterTrackingService';

// Rotating Digit Component
const RotatingDigit = ({ digit, rotateAnim }) => {
  const animatedStyle = {
    transform: [
      {
        rotateY: rotateAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: ['0deg', '180deg', '360deg'],
        }),
      },
    ],
  };

  return (
    <View style={styles.digitContainer}>
      <Animated.View style={[styles.digitBox, animatedStyle]}>
        <Text style={styles.digitText}>{digit}</Text>
      </Animated.View>
      <View style={styles.digitShadow} />
    </View>
  );
};

export default function MorningBundleModal({ visible, username, onComplete, onClose }) {
  const [step, setStep] = useState(1); // 1 = Mood, 2 = Questions, 3 = Habit Results, 4 = Warmup, 5 = Meditate, 6 = Scenarios, 7 = Scenario Questions, 8 = Vocabulary, 9 = Reminders
  const [selectedMood, setSelectedMood] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);
  
  // Warmup Zone state
  const [warmupDay, setWarmupDay] = useState(new Date().getDate());
  const [currentWarmup, setCurrentWarmup] = useState(0); // 0 = Puzzle only
  const [breathePhase, setBreathePhase] = useState('inhale'); // inhale or exhale
  
  // Scenario state
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [scenarioAnswers, setScenarioAnswers] = useState([]);
  const [currentScenarioQuestion, setCurrentScenarioQuestion] = useState(0);

  // Meditation timer state
  const [meditationTime, setMeditationTime] = useState(120); // 2 minutes in seconds
  const [isMeditationActive, setIsMeditationActive] = useState(false);
  const [breathingScale, setBreathingScale] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Meditation animations - must be defined at the top level
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Rotation animations for each digit
  const min1Rotate = useRef(new Animated.Value(0)).current;
  const min2Rotate = useRef(new Animated.Value(0)).current;
  const sec1Rotate = useRef(new Animated.Value(0)).current;
  const sec2Rotate = useRef(new Animated.Value(0)).current;
  const lastSecond = useRef(meditationTime % 60);

  // Drinking Water state (in milliliters, 0-3000ml / 12 glasses daily)
  const [waterAmount, setWaterAmount] = useState(0);
  const DAILY_GOAL_ML = 3000; // 12 glasses (12 * 250ml)
  
  // Video state
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);
  // Load water amount from shared service
  useEffect(() => {
    const loadWater = async () => {
      try {
        const ml = await WaterTrackingService.getTodayWaterIntake();
        setWaterAmount(ml);
      } catch (e) {
        console.error('Error loading water:', e);
      }
    };
    if (visible) {
    loadWater();
    }
  }, [visible]);

  // Save water amount to shared service whenever it changes
  useEffect(() => {
    const saveWater = async () => {
      try {
        await WaterTrackingService.setTodayWaterIntake(waterAmount);
      } catch (e) {
        console.error('Error saving water:', e);
      }
    };
    if (waterAmount > 0) {
    saveWater();
    }
  }, [waterAmount]);

  // Tick animation
  const tickScale = useRef(new Animated.Value(0)).current;

  // Drinking Water handlers - Using WaterTrackingService
  const handleIncrementWater = async (amount) => {
    const prevAmount = waterAmount;
    const newAmount = await WaterTrackingService.addWater(amount);
    setWaterAmount(newAmount);
      
      // Trigger tick animation when daily goal (3000ml) is reached
      if (newAmount === DAILY_GOAL_ML && prevAmount < DAILY_GOAL_ML) {
        Animated.sequence([
          Animated.spring(tickScale, {
            toValue: 1.5,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(tickScale, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      }
  };

  const handleDecrementWater = async (amount) => {
    const newAmount = await WaterTrackingService.removeWater(amount);
    setWaterAmount(newAmount);
  };
  
  // Video handler
  const handleVideoPress = async () => {
    if (isVideoPlaying) {
      await videoRef.current?.pauseAsync();
      setIsVideoPlaying(false);
    } else {
      await videoRef.current?.playAsync();
      setIsVideoPlaying(true);
    }
  };

  const morningMoods = [
    { key: 'sad', emoji: '😢', name: 'Low Energy' },
    { key: 'neutral', emoji: '😐', name: 'Auto-Pilot' },
    { key: 'content', emoji: '🙂', name: 'Calm' },
    { key: 'cheerful', emoji: '😄', name: 'Charged' },
    { key: 'loving', emoji: '🥰', name: 'Warmth' }
  ];

  const wisdomQuotes = [
    "Small consistent steps lead to unstoppable momentum.",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "You don't have to be great to start, but you have to start to be great.",
    "Progress, not perfection.",
    "Believe you can and you're halfway there."
  ];

  const randomQuote = wisdomQuotes[Math.floor(Math.random() * wisdomQuotes.length)];

  // Animated card for Scenario items
  const ScenarioItem = ({ scenario, onPress }) => {
    const scale = useRef(new Animated.Value(1)).current;
    return (
      <Animated.View
        style={{ transform: [{ scale }] }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
          onPress={onPress}
          style={styles.scenarioTouchable}
        >
          <LinearGradient
            colors={["#F8FAFC", "#F0FDF4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scenarioGradient}
          >
            <View style={styles.scenarioIconCircle}>
              <Text style={styles.scenarioEmoji}>{scenario.emoji}</Text>
            </View>
            <Text style={styles.scenarioTitle}>{scenario.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#20C997" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Meditation timer effect - must be defined at the top level
  useEffect(() => {
    if (isMeditationActive && meditationTime > 0) {
      const breathingCycle = setInterval(() => {
        setIsAnimating(true);
        // Inhale animation
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Exhale animation
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 4000,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setIsAnimating(false);
          });
        });
      }, 7000);

      const timer = setInterval(() => {
        setMeditationTime((prev) => {
          if (prev <= 1) {
            setIsMeditationActive(false);
            clearInterval(timer);
            clearInterval(breathingCycle);
            Alert.alert(
              '🎉 Complete!',
              'You\'ve earned +1 Calm Token 💧',
              [
                { text: 'Skip', onPress: () => setStep(9) },
                { text: 'Extend 2 Min', onPress: () => {
                  setMeditationTime(120);
                  setIsMeditationActive(true);
                }},
              ]
            );
            return 0;
          }
          
          // Trigger rotation animation only when second changes
          const currentSecond = prev % 60;
          if (currentSecond !== lastSecond.current) {
            lastSecond.current = currentSecond;
            
            // Crazy rotation animation for all digits
            const spinAnimation = Animated.sequence([
              Animated.timing(sec2Rotate, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.timing(sec1Rotate, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.timing(min2Rotate, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.timing(min1Rotate, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.parallel([
                Animated.timing(sec2Rotate, { toValue: 0, duration: 0, useNativeDriver: true }),
                Animated.timing(sec1Rotate, { toValue: 0, duration: 0, useNativeDriver: true }),
                Animated.timing(min2Rotate, { toValue: 0, duration: 0, useNativeDriver: true }),
                Animated.timing(min1Rotate, { toValue: 0, duration: 0, useNativeDriver: true }),
              ]),
            ]);
            
            spinAnimation.start();
          }
          
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        clearInterval(breathingCycle);
      };
    }
  }, [isMeditationActive, meditationTime]);

  // Scenario data
  const scenarios = [
    {
      key: 'traffic',
      emoji: '🚗',
      title: 'Stuck in Traffic / On the Way to Office',
      questions: [
        {
          question: "As you wait in traffic, what's your first thought?",
          options: {
            A: { text: "I'll use this moment to breathe.", emoji: "🧘‍♂️" },
            B: { text: "Why does this always happen?", emoji: "😤" },
            C: { text: "Let's just zone out with music.", emoji: "🎧" }
          }
        },
        {
          question: "What would make this ride feel lighter?",
          options: {
            A: { text: "Sending a kind message to someone", emoji: "🚀" },
            B: { text: "Planning my to-do list mentally", emoji: "🗒️" },
            C: { text: "Complaining silently", emoji: "😅" }
          }
        }
      ]
    },
    {
      key: 'office',
      emoji: '💼',
      title: 'Reaching Office / Starting Work',
      questions: [
        {
          question: "As you enter your workplace, what energy are you carrying?",
          options: {
            A: { text: "Calm and ready to start", emoji: "✨" },
            B: { text: "Neutral, just another day", emoji: "😐" },
            C: { text: "Tired, not in the mood yet", emoji: "😩" }
          }
        },
        {
          question: "How will you begin your day?",
          options: {
            A: { text: "Appreciate one colleague", emoji: "🙌" },
            B: { text: "Dive into tasks immediately", emoji: "💻" },
            C: { text: "Grab coffee and scroll", emoji: "🧋📱" }
          }
        }
      ]
    },
    {
      key: 'college',
      emoji: '🎓',
      title: 'Going to College / Institute',
      questions: [
        {
          question: "How are you feeling walking into class today?",
          options: {
            A: { text: "Curious and open", emoji: "🎒" },
            B: { text: "Just showing up as usual", emoji: "🫠" },
            C: { text: "I'd rather stay home", emoji: "😴" }
          }
        },
        {
          question: "What would make your day more meaningful?",
          options: {
            A: { text: "Helping a classmate", emoji: "🤝" },
            B: { text: "Sharing something positive", emoji: "🌟" },
            C: { text: "Just finishing early", emoji: "⏰" }
          }
        }
      ]
    },
    {
      key: 'workout',
      emoji: '🏃‍♀️',
      title: 'Morning Walk / Workout',
      questions: [
        {
          question: "What's your intention during this activity?",
          options: {
            A: { text: "To clear my mind", emoji: "💭" },
            B: { text: "To stay consistent", emoji: "💪" },
            C: { text: "To just get it done", emoji: "⏳" }
          }
        },
        {
          question: "Who can you inspire today with your effort?",
          options: {
            A: { text: "A friend or colleague", emoji: "👯‍♂️" },
            B: { text: "My family seeing my progress", emoji: "👨‍👩‍👦" },
            C: { text: "No one — this is just for me", emoji: "🙃" }
          }
        }
      ]
    },
    {
      key: 'home',
      emoji: '☕',
      title: 'Still at Home / Getting Ready',
      questions: [
        {
          question: "How's your morning energy right now?",
          options: {
            A: { text: "Calm and hopeful", emoji: "🌅" },
            B: { text: "Neutral, just waking up", emoji: "😴" },
            C: { text: "Low, not feeling it today", emoji: "😔" }
          }
        },
        {
          question: "What's one small thing that could lift your mood?",
          options: {
            A: { text: "Sending gratitude to someone", emoji: "💌" },
            B: { text: "Watching my motivation clip", emoji: "🎥" },
            C: { text: "Ignoring everything for now", emoji: "😬" }
          }
        }
      ]
    }
  ];

  // Warmup data - rotates based on day
  const getWarmupActivities = () => {
    const day = warmupDay % 7; // Cycle through 7 days
    const puzzles = [
      { question: "What comes next: 2, 4, 8, ?", answer: "16", explanation: "Each number is doubled" },
      { question: "Complete the pattern: A, C, E, G, ?", answer: "I", explanation: "Every other letter" },
      { question: "3 + 5 = 8, so 7 + 9 = ?", answer: "16", explanation: "Simple addition" },
    ];
    
    const vocabulary = [
      { word: "Resilience", meaning: "ability to bounce back" },
      { word: "Mindfulness", meaning: "awareness of the present moment" },
      { word: "Empathy", meaning: "understanding others' feelings" },
      { word: "Purpose", meaning: "a reason for existence" },
      { word: "Gratitude", meaning: "feeling thankful" },
    ];
    
    return {
      puzzle: puzzles[day % puzzles.length],
      vocabulary: vocabulary[day % vocabulary.length],
    };
  };

  const warmupData = getWarmupActivities();

  // Handle mood selection
  const handleMoodSelect = (moodKey) => {
    setSelectedMood(moodKey);
  };

  // Move to questions
  const handleNextFromMood = () => {
    if (selectedMood) {
      setStep(2);
      setAnswers([]);
      setCurrentQuestion(0);
    }
  };

  // Handle question answer
  const handleAnswer = async (answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    const moodData = MoodAssessmentService.moodData[selectedMood];
    const totalQuestions = moodData.questions.length;

    if (currentQuestion < totalQuestions - 1) {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered, calculate results
      const results = MoodAssessmentService.calculateMoodAssessment(selectedMood, newAnswers);
      setAssessmentResults(results);
      setStep(10); // Move to Motivation (Step 10)
    }
  };

  // Handle adding habit
  const handleAddHabit = async () => {
    if (!selectedHabit) return;

    try {
      const goal = {
        id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: selectedHabit.title,
        description: selectedHabit.description,
        category: 'Mood Assessment',
        frequency: 'Daily',
        pledgeAmount: 1,
        createdAt: new Date(),
        targetDate: new Date(),
      };

      await GoalsService.addGoal(goal);
      Alert.alert('✅ Habit Added!', 'Your habit has been added successfully.');
      
      // Move to motivation (Step 10)
      setStep(10);
    } catch (error) {
      console.error('Error adding habit:', error);
      Alert.alert('Error', 'Failed to add habit');
    }
  };

  // Skip to motivation
  const handleSkip = () => {
    setStep(10); // Move to Motivation
  };
  
  // Handle scenario selection
  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
    setScenarioAnswers([]);
    setCurrentScenarioQuestion(0);
    setStep(6); // Move to Scenario Questions
  };
  
  // Handle scenario question answer
  const handleScenarioAnswer = (answer) => {
    const newAnswers = [...scenarioAnswers, answer];
    setScenarioAnswers(newAnswers);
    
    if (currentScenarioQuestion < 1) {
      // Move to next question
      setCurrentScenarioQuestion(1);
    } else {
      // Both questions answered, move to vocabulary
      setStep(7);
    }
  };
  
  

  // Complete morning bundle
  const handleComplete = async () => {
    try {
      const userEmail = await UserSessionService.getCurrentUserEmail();
      if (userEmail) {
        const today = new Date().toDateString();
        await UserSessionService.setAsyncStorageItem(`morning_bundle_${userEmail}`, today);
      }
      // Reset state
      setStep(1);
      setSelectedMood(null);
      setAnswers([]);
      setCurrentQuestion(0);
      setAssessmentResults(null);
      setSelectedHabit(null);
      onComplete();
    } catch (error) {
      console.error('Error completing morning bundle:', error);
    }
  };

  // Get current question
  const getCurrentQuestion = () => {
    if (!selectedMood) return null;
    const moodData = MoodAssessmentService.moodData[selectedMood];
    return moodData.questions[currentQuestion];
  };

  const question = getCurrentQuestion();

  // Render based on step
  if (step === 1) {
    // Step 1: Mood Check
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
              <Text style={styles.brainEmoji}>🧠</Text>
              <Text style={styles.title}>
                💬 Hey {username}, how's your mood this morning?
              </Text>
            </View>

            <View style={styles.moodContainer}>
              {morningMoods.map((mood) => (
                <TouchableOpacity
                  key={mood.key}
                  style={[
                    styles.moodButton,
                    selectedMood === mood.key && styles.moodButtonSelected
                  ]}
                  onPress={() => handleMoodSelect(mood.key)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.subtext}>
              We'll shape your morning around how you feel.
            </Text>

            <TouchableOpacity
              style={[
                styles.nextButton,
                !selectedMood && styles.nextButtonDisabled
              ]}
              onPress={handleNextFromMood}
              disabled={!selectedMood}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={selectedMood ? ['#20C997', '#17A085'] : ['#D0D0D0', '#B0B0B0']}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>Continue →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (step === 2 && question) {
    // Step 2: Questions
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionTitle}>
                Question {currentQuestion + 1} of {MoodAssessmentService.moodData[selectedMood].questions.length}
              </Text>
            </View>

            <ScrollView style={styles.questionScroll} contentContainerStyle={styles.questionContent}>
              <Text style={styles.questionText}>{question.question}</Text>

              <View style={styles.optionsContainer}>
                {Object.entries(question.options).map(([key, value]) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.optionButton}
                    onPress={() => handleAnswer(key)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#E6FCF5', '#F0FDF4']}
                      style={styles.optionGradient}
                    >
                      <Text style={styles.optionKey}>{key}:</Text>
                      <Text style={styles.optionValue}>{value}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  if (step === 10) {
    // Step 10: Motivation - Quote and Video
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
              <Text style={styles.brainEmoji}>✨</Text>
              <Text style={styles.title}>
                🌞 Motivation for Today
              </Text>
            </View>

            <View style={styles.quoteContainer}>
              <Text style={styles.quote}>"{randomQuote}"</Text>
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
              {!isVideoPlaying && (
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
              onPress={() => setStep(4)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                style={styles.completeButtonGradient}
              >
                <Text style={styles.completeButtonText}>
                  Feeling ready 💪
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (step === 4) {
    // Step 4: Warmup Zone - Only Puzzle
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
              <Text style={styles.brainEmoji}>🧠</Text>
              <Text style={styles.title}>
                🧩 Quick Morning Warmup
              </Text>
            </View>

            <View style={styles.warmupContent}>
              <View style={styles.puzzleCard}>
                <Text style={styles.puzzleQuestion}>{warmupData.puzzle.question}</Text>
                <Text style={styles.puzzleExplanation}>{warmupData.puzzle.explanation}</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => setStep(5)}
                activeOpacity={0.8}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => setStep(5)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#20C997', '#17A085']}
                  style={styles.nextButtonGradient}
                >
                  <Text style={styles.nextButtonText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  if (false && step === 3 && assessmentResults) {
    // Step 3: Results and Habit Recommendations (DISABLED - moved to Step 9)
    const moodData = MoodAssessmentService.moodData[selectedMood];
    const recommendedHabit = assessmentResults.recommendedHabit;
    const habitCategory = assessmentResults.habitCategory;
    const allHabits = Object.values(moodData.habits);

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>✨ Your Mood Assessment</Text>
              <Text style={styles.resultsScore}>Mood Index: {assessmentResults.moodIndex}%</Text>
            </View>

            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>{assessmentResults.message}</Text>
            </View>

            <View style={styles.habitsContainer}>
              <Text style={styles.habitsTitle}>Recommended Habits:</Text>
              
              {/* Primary Recommended Habit based on score */}
              {recommendedHabit && (
                <View style={styles.primaryRecommendationCard}>
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>⭐ Primary Recommendation</Text>
                  </View>
                  <Text style={styles.primaryHabitTitle}>{recommendedHabit.title}</Text>
                  <Text style={styles.primaryHabitDescription}>{recommendedHabit.description}</Text>
                  <Text style={styles.primaryHabitType}>{recommendedHabit.type}</Text>
                </View>
              )}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.8}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.addHabitButton
                ]}
                onPress={() => {
                  // Always use the recommended habit
                  if (recommendedHabit) {
                    setSelectedHabit(recommendedHabit);
                    handleAddHabit();
                  }
                }}
                disabled={!recommendedHabit}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={recommendedHabit ? ['#20C997', '#17A085'] : ['#D0D0D0', '#B0B0B0']}
                  style={styles.addHabitGradient}
                >
                  <Ionicons name="add" size={24} color="#FFF" />
                  <Text style={styles.addHabitText}>Add Habit</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  }

  if (step === 5) {
    // Step 5: Scenario Selection
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
            <View style={styles.header}>
              <Text style={styles.brainEmoji}>📍</Text>
              <Text style={styles.title}>
                Where are you right now?
              </Text>
              <Text style={styles.subtitle}>
                Select your current situation
              </Text>
            </View>

            <View style={styles.scenariosGrid}>
              {scenarios.map((scenario) => (
                <ScenarioItem
                  key={scenario.key}
                  scenario={scenario}
                  onPress={() => handleScenarioSelect(scenario)}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => setStep(7)}
              activeOpacity={0.8}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    );
  }

  if (step === 6 && selectedScenario) {
    // Step 6: Scenario Questions
    const currentQuestion = selectedScenario.questions[currentScenarioQuestion];
    
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
              <Text style={styles.brainEmoji}>{selectedScenario.emoji}</Text>
              <Text style={styles.questionTitle}>
                Question {currentScenarioQuestion + 1} of 2
              </Text>
            </View>

            <ScrollView style={styles.questionScroll} contentContainerStyle={styles.questionContent}>
              <Text style={styles.questionText}>{currentQuestion.question}</Text>

              <View style={styles.optionsContainer}>
                {Object.entries(currentQuestion.options).map(([key, option]) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.optionButton}
                    onPress={() => handleScenarioAnswer(key)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#E6FCF5', '#F0FDF4']}
                      style={styles.optionGradient}
                    >
                      <Text style={styles.optionKey}>{key}:</Text>
                      <View style={styles.optionContent}>
                        <Text style={styles.optionEmoji}>{option.emoji}</Text>
                        <Text style={styles.optionValue}>{option.text}</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  if (false && step === 6) {
    // Step 6 (old): Reminders - Review Goals and Habits
    // Step 5: Scenario Selection
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
            <View style={styles.header}>
              <Text style={styles.brainEmoji}>📍</Text>
              <Text style={styles.title}>
                Where are you right now?
              </Text>
              <Text style={styles.subtitle}>
                Select your current situation
              </Text>
            </View>

            <View style={styles.scenariosGrid}>
              {scenarios.map((scenario) => (
                <TouchableOpacity
                  key={scenario.key}
                  style={styles.scenarioCard}
                  onPress={() => handleScenarioSelect(scenario)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.scenarioEmoji}>{scenario.emoji}</Text>
                  <Text style={styles.scenarioTitle}>{scenario.title}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => setStep(7)}
              activeOpacity={0.8}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    );
  }

  if (step === 6 && selectedScenario) {
    // Step 6: Scenario Questions
    const currentQuestion = selectedScenario.questions[currentScenarioQuestion];
    
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
              <Text style={styles.brainEmoji}>{selectedScenario.emoji}</Text>
              <Text style={styles.questionTitle}>
                Question {currentScenarioQuestion + 1} of 2
              </Text>
            </View>

            <ScrollView style={styles.questionScroll} contentContainerStyle={styles.questionContent}>
              <Text style={styles.questionText}>{currentQuestion.question}</Text>

              <View style={styles.optionsContainer}>
                {Object.entries(currentQuestion.options).map(([key, option]) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.optionButton}
                    onPress={() => handleScenarioAnswer(key)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#E6FCF5', '#F0FDF4']}
                      style={styles.optionGradient}
                    >
                      <Text style={styles.optionKey}>{key}:</Text>
                      <View style={styles.optionContent}>
                        <Text style={styles.optionEmoji}>{option.emoji}</Text>
                        <Text style={styles.optionValue}>{option.text}</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  if (step === 7) {
    // Step 7: Vocabulary - Word of the Day
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
              <Text style={styles.title}>📚 Word of the Day</Text>
            </View>

            <View style={styles.vocabWordBox}>
              <Text style={styles.vocabWord}>{warmupData.vocabulary.word}</Text>
            </View>

            <View style={styles.vocabMeaningBox}>
              <Text style={styles.vocabMeaning}>{warmupData.vocabulary.meaning}</Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => {
                  setMeditationTime(120);
                  setIsMeditationActive(false);
                  setStep(8);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => {
                  setMeditationTime(120);
                  setIsMeditationActive(false);
                  setStep(8);
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#20C997', '#17A085']}
                  style={styles.nextButtonGradient}
                >
                  <Text style={styles.nextButtonText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }


  if (step === 8) {
    // Step 8: Meditate - 2-Minute Reset
    const minutes = Math.floor(meditationTime / 60);
    const seconds = meditationTime % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Helper function to get individual digits
    const getTimeDigits = () => {
      const minStr = minutes.toString().padStart(2, '0');
      const secStr = seconds.toString().padStart(2, '0');
      return {
        min1: minStr[0],
        min2: minStr[1],
        sec1: secStr[0],
        sec2: secStr[1],
      };
    };
    
    const timeDigits = getTimeDigits();

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlayMeditate}>
          <View style={styles.containerMeditate}>
            <View style={styles.meditationHeader}>
              <Text style={styles.meditationTitle}>🌿 2-Minute Reset</Text>
              <Text style={styles.meditationSubtitle}>
                {isMeditationActive ? 'Breathe and relax' : 'Find your calm'}
              </Text>
            </View>

            {/* Rotating Clock Timer Display */}
            <View style={styles.clockContainer}>
              <View style={styles.clockRow}>
                {/* Minutes */}
                <RotatingDigit digit={timeDigits.min1} rotateAnim={min1Rotate} />
                <RotatingDigit digit={timeDigits.min2} rotateAnim={min2Rotate} />

                {/* Colon */}
                <View style={styles.clockColon}>
                  <Text style={styles.colonText}>:</Text>
                </View>

                {/* Seconds */}
                <RotatingDigit digit={timeDigits.sec1} rotateAnim={sec1Rotate} />
                <RotatingDigit digit={timeDigits.sec2} rotateAnim={sec2Rotate} />
              </View>
            </View>

            {/* Action buttons */}
            {!isMeditationActive ? (
              <View style={styles.meditationButtonRow}>
                <TouchableOpacity
                  style={styles.startMeditationButton}
                  onPress={() => {
                    setIsMeditationActive(true);
                    setBreathePhase('inhale');
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#20C997', '#17A085']}
                    style={styles.startButtonGradient}
                  >
                    <Ionicons name="play" size={24} color="#FFF" />
                    <Text style={styles.startButtonText}>Tap Start</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => {
                    setIsMeditationActive(false);
                    setStep(9);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.meditationButtonRowActive}>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => {
                    setIsMeditationActive(false);
                    setStep(9);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  if (step === 9) {
    // Step 9: Reminders - Review Goals and Habits
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.remindersHeaderRow}>
              <Ionicons name="clipboard" size={18} color="#20C997" />
              <Text style={styles.remindersTitleInline}>Review Goals and Habits</Text>
            </View>

            {/* Compact Grid Layout */}
            <View style={styles.remindersGrid}>
              <TouchableOpacity style={styles.reminderCardCompact} activeOpacity={0.7}>
                <View style={styles.reminderIconWrapper}>
                  <Ionicons name="checkmark-circle" size={36} color="#20C997" />
                </View>
                <Text style={styles.reminderTitleCompact}>Habits</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.reminderCardCompact} activeOpacity={0.7}>
                <View style={styles.reminderIconWrapper}>
                  <Ionicons name="flag" size={36} color="#667eea" />
                </View>
                <Text style={styles.reminderTitleCompact}>Goals</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.reminderCardCompact} activeOpacity={0.7}>
                <View style={styles.reminderIconWrapper}>
                  <Ionicons name="trophy" size={36} color="#FFD700" />
                </View>
                <Text style={styles.reminderTitleCompact}>Mood</Text>
              </TouchableOpacity>
            </View>

            {assessmentResults && (
              <View style={styles.reminderDescriptionContainer}>
                <Text style={styles.reminderDescriptionTitle}>
                  Your Morning Results 🌅
                </Text>

                {/* Drinking Water Section - Compact with Title and Round Add */}
                <View style={styles.drinkingWaterContainer}>
                  <View style={styles.drinkingWaterHeaderRow}>
                    <Ionicons name="water" size={18} color="#20C997" />
                    <Text style={styles.drinkingWaterTitleText}>Drinking Water</Text>
                  </View>
                  {/* Prompt removed for compactness */}
                  
                  <View style={styles.drinkingWaterGlassesContainer}>
                    {/* Header row with glass illustration and goal */}
                    <View style={styles.waterHeaderRow}> 
                      <View style={styles.waterGlassIconBox}>
                        <View style={styles.waterGlassLiquid} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dailyGoalText}>Daily Goal: 12 glasses</Text>
                        <Text style={styles.glassCountText}>{Math.floor(waterAmount/250)} / 12 Glasses</Text>
                      </View>
                    </View>

                    {/* Chip control */}
                    <View style={styles.waterChip}>
                      <TouchableOpacity
                        onPress={() => handleDecrementWater(250)}
                        disabled={waterAmount < 250}
                        style={[styles.waterChipIcon, waterAmount < 250 && { opacity: 0.4 }]}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="remove" size={18} color="#2D3748" />
                      </TouchableOpacity>
                      <Text style={styles.waterChipLabel}>250ml / 1 glass</Text>
                      <TouchableOpacity
                        onPress={() => handleIncrementWater(250)}
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
                  </View>
                  
                  {/* Compact Progress Bar */}
                  <View style={styles.waterProgressContainer}>
                    <View style={styles.waterProgressBar}>
                      <View style={[styles.waterProgressFill, { width: `${(waterAmount / DAILY_GOAL_ML) * 100}%` }]} />
                    </View>
                  </View>
                </View>

                {/* removed quick button to keep main CTA at bottom */}

                <View style={styles.reminderHabitCard}>
                  <View style={styles.reminderHabitInfo}>
                    <Text style={styles.reminderHabitLabel}>Recommended Habit</Text>
                    <Text style={styles.reminderHabitName}>
                      {assessmentResults.recommendedHabit?.title}
                    </Text>
                    <Text style={styles.reminderHabitDescription}>
                      {assessmentResults.recommendedHabit?.description}
                    </Text>
                    <Text style={styles.reminderHabitType}>
                      {assessmentResults.recommendedHabit?.type}
                    </Text>
                  </View>
                </View>

                {/* Primary Add button always visible below habit card */}
                <TouchableOpacity
                  style={styles.primaryAddButton}
                  onPress={async () => {
                    if (assessmentResults?.recommendedHabit) {
                      try {
                        const goal = {
                          title: assessmentResults.recommendedHabit.title,
                          description: assessmentResults.recommendedHabit.description,
                          category: assessmentResults.recommendedHabit.type.toLowerCase(),
                          frequency: 'Daily',
                          progress: 0,
                        };
                        await GoalsService.addGoal(goal);
                        Alert.alert('✅ Added!', 'Your morning habit has been added to your custom habits.');
                      } catch (error) {
                        console.error('Error adding habit:', error);
                      }
                    }
                  }}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#20C997', '#17A085']}
                    style={styles.primaryAddGradient}
                  >
                    <Ionicons name="add-circle" size={20} color="#FFF" />
                    <Text style={styles.primaryAddText}>+ Add to my habits</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.goToHabitsButton, { marginTop: 10 }]}
              onPress={() => {
                handleComplete();
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#20C997', '#17A085']}
                style={styles.goToHabitsGradient}
              >
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
                <Text style={styles.goToHabitsText}>
                  Go check your remaining habits ⏰
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (false && step === 8) {
    // Step 8: Meditate - 2-Minute Reset
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
              <Text style={styles.brainEmoji}>🌿</Text>
              <Text style={styles.title}>
                2-Minute Reset
              </Text>
            </View>

            <View style={styles.meditateContent}>
              <View style={styles.breathingCircleContainer}>
                <View style={styles.breathingCircle}>
                  <Ionicons name="leaf" size={64} color="#20C997" />
                </View>
              </View>
              
              <View style={styles.breathingTextContainer}>
                <Text style={styles.breathingText}>
                  {breathePhase === 'inhale' ? 'Inhale...' : 'Exhale...'}
                </Text>
                <Text style={styles.breathingSubtext}>Follow the rhythm</Text>
              </View>
              
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>Take a deep breath and relax</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => setStep(8)}
                activeOpacity={0.8}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => setStep(7)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#20C997', '#17A085']}
                  style={styles.nextButtonGradient}
                >
                  <Ionicons name="water" size={20} color="#FFF" />
                  <Text style={styles.nextButtonText}>
                    Complete and earn +1 Calm Token 💧
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  if (false && step === 9) {
    // Step 9: Motivation for the Day
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
              <Text style={styles.brainEmoji}>✨</Text>
              <Text style={styles.title}>
                🌞 Motivation for Today
              </Text>
            </View>

            <View style={styles.quoteContainer}>
              <Text style={styles.quote}>"{randomQuote}"</Text>
            </View>

            <View style={styles.videoContainer}>
              <Video
                source={require('../../assets/videos/motivation.mp4')}
                style={styles.videoPlayer}
                useNativeControls={true}
                resizeMode="cover"
                shouldPlay={false}
              />
            </View>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleComplete}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                style={styles.completeButtonGradient}
              >
                <Text style={styles.completeButtonText}>
                  Feeling ready 💪
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
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 340,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  containerContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  brainEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
    lineHeight: 24,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  moodButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodButtonSelected: {
    backgroundColor: '#20C997',
    borderColor: '#20C997',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  moodEmoji: {
    fontSize: 32,
  },
  subtext: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonDisabled: {
    shadowOpacity: 0,
  },
  nextButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  questionHeader: {
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#20C997',
    textAlign: 'center',
  },
  questionScroll: {
    maxHeight: 500,
  },
  questionContent: {
    paddingBottom: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionGradient: {
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  optionKey: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#20C997',
    marginRight: 12,
  },
  optionValue: {
    flex: 1,
    fontSize: 14,
    color: '#2D3748',
    lineHeight: 20,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
  },
  resultsScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#20C997',
  },
  messageContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  messageText: {
    fontSize: 14,
    color: '#2D3748',
    lineHeight: 20,
    textAlign: 'center',
  },
  habitsContainer: {
    marginBottom: 24,
  },
  habitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 16,
  },
  habitCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  habitCardSelected: {
    borderColor: '#20C997',
    backgroundColor: '#F0FDF4',
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
  },
  habitDescription: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 8,
    lineHeight: 20,
  },
  habitType: {
    fontSize: 12,
    color: '#20C997',
    fontWeight: '600',
  },
  primaryRecommendationCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#20C997',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryBadge: {
    backgroundColor: '#20C997',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  primaryBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  primaryHabitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
  },
  primaryHabitDescription: {
    fontSize: 15,
    color: '#4A5568',
    marginBottom: 12,
    lineHeight: 22,
  },
  primaryHabitType: {
    fontSize: 13,
    color: '#20C997',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  otherHabitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
    marginTop: 12,
    marginBottom: 12,
  },
  warmupContent: {
    marginBottom: 24,
  },
  puzzleCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  puzzleQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 16,
    textAlign: 'center',
  },
  puzzleExplanation: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  quizCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 32,
    borderWidth: 2,
    borderColor: '#20C997',
    alignItems: 'center',
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
    marginTop: 16,
    marginBottom: 8,
  },
  quizDescription: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
  },
  vocabCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 32,
    borderWidth: 2,
    borderColor: '#FED7AA',
    alignItems: 'center',
  },
  vocabWord: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 12,
  },
  vocabMeaning: {
    fontSize: 16,
    color: '#B45309',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  meditateContent: {
    marginBottom: 32,
    alignItems: 'center',
  },
  breathingCircleContainer: {
    marginBottom: 32,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E6FCF5',
    borderWidth: 4,
    borderColor: '#20C997',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  breathingTextContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  breathingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#20C997',
    marginBottom: 8,
  },
  breathingSubtext: {
    fontSize: 14,
    color: '#718096',
    fontStyle: 'italic',
  },
  timerContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  timerText: {
    fontSize: 14,
    color: '#2D3748',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  remindersHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    justifyContent: 'center',
  },
  remindersTitleInline: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
  },
  remindersGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  reminderCardCompact: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    minHeight: 70,
    justifyContent: 'center',
  },
  reminderIconWrapper: {
    marginBottom: 6,
  },
  reminderTitleCompact: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
  },
  reminderDescriptionContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#20C997',
    overflow: 'visible',
  },
  reminderDescriptionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 8,
  },
  reminderScoreContainer: {
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#C6F6D5',
  },
  reminderScoreLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 2,
    fontWeight: '600',
  },
  reminderScoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#20C997',
  },
  reminderHabitCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 2,
    borderColor: '#C6F6D5',
    marginTop: 8,
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'visible',
  },
  reminderHabitInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderHabitLabel: {
    fontSize: 11,
    color: '#718096',
    marginBottom: 4,
    fontWeight: '600',
  },
  reminderHabitName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 4,
  },
  reminderHabitDescription: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 20,
  },
  reminderHabitType: {
    fontSize: 9,
    color: '#20C997',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  // Drinking Water Styles
  drinkingWaterContainer: {
    backgroundColor: '#E6FCF5',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#81E6D9',
  },
  drinkingWaterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  drinkingWaterTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A202C',
  },
  drinkingWaterPrompt: {
    fontSize: 12,
    color: '#4A5568',
    marginBottom: 10,
    textAlign: 'center',
  },
  drinkingWaterGlassesContainer: {
    gap: 8,
    marginBottom: 10,
  },
  waterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waterGlassIconBox: {
    width: 34,
    height: 44,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#20C997',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  waterGlassLiquid: {
    height: 22,
    backgroundColor: '#C6F6D5',
  },
  dailyGoalText: {
    fontSize: 12,
    color: '#718096',
  },
  glassCountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
  },
  waterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#C6F6D5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    gap: 10,
    alignSelf: 'flex-start',
  },
  waterChipIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterChipPlus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E6FCF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  waterChipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    paddingHorizontal: 4,
  },
  hydrationTip: {
    marginTop: 6,
    fontSize: 12,
    color: '#20C997',
    fontWeight: '600',
  },
  drinkingWaterGlassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  waterGlassButton: {
    padding: 2,
  },
  waterCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#20C997',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  waterGlassInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  waterGlassLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A202C',
  },
  waterProgressContainer: {
    alignItems: 'center',
  },
  waterProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#C6F6D5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  waterProgressFill: {
    height: '100%',
    backgroundColor: '#20C997',
    borderRadius: 3,
  },
  waterCompletionSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  waterCompletionTextSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#20C997',
  },
  waterTipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#C6F6D5',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  waterTipText: {
    flex: 1,
    fontSize: 12,
    color: '#2D3748',
  },
  addHabitButton: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 6,
  },
  addHabitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  addHabitButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
  },
  addHabitIcon: {
    marginTop: 4,
  },
  reminderDescriptionText: {
    fontSize: 14,
    color: '#2D3748',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  goToHabitsButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  goToHabitsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  goToHabitsText: {
    fontSize: 15,
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
  primaryAddButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 8,
    marginBottom: 8,
  },
  primaryAddGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  primaryAddText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scenariosGrid: {
    gap: 12,
    marginBottom: 24,
  },
  scenarioTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  scenarioGradient: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2F7EF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scenarioIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  scenarioEmoji: {
    fontSize: 24,
  },
  scenarioTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
    lineHeight: 20,
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionEmoji: {
    fontSize: 20,
  },
  vocabWordBox: {
    backgroundColor: '#20C997',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  vocabWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    lineHeight: 38,
  },
  vocabMeaningBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  vocabMeaning: {
    fontSize: 15,
    color: '#2D3748',
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  meditationButtonRow: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  meditationButtonRowActive: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  addHabitButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addHabitButtonDisabled: {
    opacity: 0.5,
  },
  addHabitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  addHabitText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  quoteContainer: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#20C997',
    height: 250,
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
  completeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
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
  overlayMeditate: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  containerMeditate: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
    alignItems: 'center',
  },
  meditationHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  meditationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
  },
  meditationSubtitle: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
  },
  timerCircleContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerOuterCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#F0FDF4',
    borderWidth: 6,
    borderColor: '#20C997',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  timerMiddleCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#C6F6D5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#A6F5DC',
  },
  timerInnerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#20C997',
  },
  timerDisplay: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#20C997',
    letterSpacing: 1,
  },
  breathingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  breathingCircleAnimated: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E6FCF5',
    borderWidth: 4,
    borderColor: '#20C997',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  breathingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 16,
    letterSpacing: 1,
  },
  startMeditationButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    width: '100%',
    marginBottom: 12,
  },
  skipMeditationButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    width: '100%',
  },
  skipMeditationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#718096',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  clockContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  clockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  digitContainer: {
    position: 'relative',
  },
  digitBox: {
    width: 50,
    height: 65,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#20C997',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    backfaceVisibility: 'hidden',
  },
  digitText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#20C997',
    fontFamily: 'System',
  },
  digitShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#E0E0E0',
    opacity: 0.2,
    borderRadius: 8,
  },
  clockColon: {
    paddingHorizontal: 8,
  },
  colonText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#20C997',
    fontFamily: 'System',
  },
});

