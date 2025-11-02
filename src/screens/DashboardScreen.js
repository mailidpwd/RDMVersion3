import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Animated,
  Easing,
  Linking,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { GoalsService } from '../services/GoalsService';
import { UserSessionService } from '../services/UserSessionService';
import UserDataService from '../services/UserDataService';
import MoodAssessmentService from '../services/MoodAssessmentService';
import WaterTrackingService from '../services/WaterTrackingService';
import BottomNavigationBar from '../components/BottomNavigationBar';
import MoodAssessmentScreen from './MoodAssessmentScreen';
import MoodHabitRecommendationsModal from '../components/MoodHabitRecommendationsModal';
import MorningBundleModal from '../components/MorningBundleModal';
import AfternoonBundleModal from '../components/AfternoonBundleModal';
import EveningBundleModal from '../components/EveningBundleModal';

export default function DashboardScreen({ navigation }) {
  const handleCheckScore = async () => {
    try {
      const isSignedUp = await UserSessionService.isCurrentUserSignedIn();
      if (isSignedUp) {
        navigation.navigate('QuizHub');
      } else {
        navigation.navigate('LeadershipIntro');
      }
    } catch (error) {
      navigation.navigate('LeadershipIntro');
    }
  };
  const [goals, setGoals] = useState([]);
  const [selectedMood, setSelectedMood] = useState(-1);
  const [isRdmSelected, setIsRdmSelected] = useState(true);
  const [username, setUsername] = useState('User');
  const [showMoodAssessment, setShowMoodAssessment] = useState(false);
  const [selectedMoodData, setSelectedMoodData] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [modifyHabitVisible, setModifyHabitVisible] = useState(false);
  const [habitToModify, setHabitToModify] = useState(null);
  const [modifiedHabitText, setModifiedHabitText] = useState('');
  const [showHabitOptions, setShowHabitOptions] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const scrollY = React.useRef(0);
  const [mindfulnessScore, setMindfulnessScore] = useState(0);
  const [purposefulnessScore, setPurposefulnessScore] = useState(0);
  const [empathyScore, setEmpathyScore] = useState(0);
  const [leadershipScore, setLeadershipScore] = useState(0);
  const [showMorningBundle, setShowMorningBundle] = useState(false);
  const [showAfternoonBundle, setShowAfternoonBundle] = useState(false);
  const [showEveningBundle, setShowEveningBundle] = useState(false);

  // Checkbox states for Goals and Habits with animations
  const [checkedGoals, setCheckedGoals] = useState({
    water: false,
    project: false,
    reading: false,
  });
  
  const [checkedHabits, setCheckedHabits] = useState({
    meditate: false,
    steps: false,
    sugar: false,
  });

  // Water tracking state
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const WATER_GOAL = 12; // 3L = 12 glasses of 250ml

  // Portfolio state
  const [portfolioValue, setPortfolioValue] = useState(100.00);
  const [portfolioCurrency, setPortfolioCurrency] = useState('USDT'); // USDT or RDM

  // Load water tracking data
  const loadWaterData = async () => {
    const glasses = await WaterTrackingService.getGlassesCount();
    setWaterGlasses(glasses);
    const isComplete = await WaterTrackingService.isGoalComplete();
    setCheckedGoals(prev => ({ ...prev, water: isComplete }));
  };

  // Handle water goal click - open modal
  const handleWaterGoalClick = async () => {
    await loadWaterData(); // Load latest data before showing modal
    setShowWaterModal(true);
  };

  // Add water glass
  const addWaterGlass = async () => {
    const newAmount = await WaterTrackingService.addWater(250); // Add 250ml
    const glasses = Math.floor(newAmount / 250);
    setWaterGlasses(glasses);
    
    // Check if goal is complete
    if (newAmount >= 3000) {
      setCheckedGoals(prev => ({ ...prev, water: true }));
    }
  };

  // Remove water glass
  const removeWaterGlass = async () => {
    const newAmount = await WaterTrackingService.removeWater(250); // Remove 250ml
    const glasses = Math.floor(newAmount / 250);
    setWaterGlasses(glasses);
    
    // Uncheck if below goal
    if (newAmount < 3000) {
      setCheckedGoals(prev => ({ ...prev, water: false }));
    }
  };

  // Toggle goal checkbox (for non-water goals)
  const toggleGoal = (goalKey) => {
    if (goalKey === 'water') {
      handleWaterGoalClick();
    } else {
      setCheckedGoals(prev => ({
        ...prev,
        [goalKey]: !prev[goalKey]
      }));
    }
  };

  // Toggle habit checkbox
  const toggleHabit = (habitKey) => {
    setCheckedHabits(prev => ({
      ...prev,
      [habitKey]: !prev[habitKey]
    }));
  };

  // Handle long press on habit
  const handleHabitLongPress = (habit) => {
    setSelectedHabit(habit);
    setShowHabitOptions(true);
  };

  // Handle modify from options modal
  const handleModifyFromOptions = () => {
    if (selectedHabit) {
      setHabitToModify(selectedHabit);
      setModifiedHabitText(selectedHabit.title || selectedHabit.description);
      setShowHabitOptions(false);
      setModifyHabitVisible(true);
    }
  };

  // Handle delete from options modal
  const handleDeleteFromOptions = () => {
    if (selectedHabit) {
      setShowHabitOptions(false);
      handleDeleteHabit(selectedHabit);
      // Small delay to allow modal to close before showing delete confirmation
      setTimeout(() => {
        setSelectedHabit(null);
      }, 300);
    }
  };

  // Save modified habit
  const handleSaveModifiedHabit = async () => {
    if (!habitToModify || !modifiedHabitText.trim()) {
      Alert.alert('Error', 'Please enter a valid habit description.');
      return;
    }

    try {
      const isMoodHabit = habitToModify.category === 'Mood Assessment';
      const newTitle = modifiedHabitText.trim();

      if (isMoodHabit) {
        // Update mood habit
        await GoalsService.updateGoal({
          ...habitToModify,
          description: newTitle,
        });
      } else {
        // Update custom/configured habit
        await GoalsService.updateGoal({
          ...habitToModify,
          title: newTitle,
          description: newTitle,
        });
      }

      await loadAllHabits();
      setModifyHabitVisible(false);
      setHabitToModify(null);
      setModifiedHabitText('');
      Alert.alert('Success', 'Habit updated successfully!');
    } catch (error) {
      console.error('Error updating habit:', error);
      Alert.alert('Error', 'Failed to update habit.');
    }
  };

  // Delete habit
  const handleDeleteHabit = async (habit) => {
    try {
      await GoalsService.deleteGoal(habit.id);
      await loadAllHabits();
      // No confirmation needed, just delete immediately
    } catch (error) {
      console.error('Error deleting habit:', error);
      Alert.alert('Error', 'Failed to delete habit.');
    }
  };

  const moodData = {
    sad: {
      key: 'sad',
      emoji: '😢',
      name: 'SAD',
      description: 'I feel low, unseen, or emotionally heavy.',
      questions: [
        {
          question: 'When you notice this sadness, what do you usually do first?',
          options: {
            A: 'I pause and try to understand what triggered it.',
            B: 'I distract myself or keep busy.',
            C: 'I withdraw or shut down without realizing.'
          }
        },
        {
          question: 'Right now, what does your body feel like doing?',
          options: {
            A: 'Take a deep breath and maybe a small step forward.',
            B: 'Sit quietly and wait for it to pass.',
            C: 'Curl up, stay still, or sleep it off.'
          }
        },
        {
          question: 'Which thought feels most true right now?',
          options: {
            A: '"This will pass — I\'ve handled worse."',
            B: '"I just need a break."',
            C: '"Nothing really helps anymore."'
          }
        }
      ]
    },
    neutral: {
      key: 'neutral',
      emoji: '😐',
      name: 'NEUTRAL',
      description: 'I\'m okay but not really *in* life right now.',
      questions: [
        {
          question: 'Do you notice what\'s missing from your day today?',
          options: {
            A: 'Yes — I can sense I\'m under-stimulated.',
            B: 'Not really sure — I\'m floating through it.',
            C: 'I don\'t notice anything missing, but I feel numb.'
          }
        },
        {
          question: 'When you\'re in this state, what do you usually do?',
          options: {
            A: 'Try a light activity or talk to someone.',
            B: 'Keep scrolling or doing small tasks.',
            C: 'Withdraw into silence or avoid everything.'
          }
        },
        {
          question: 'Which line fits your headspace right now?',
          options: {
            A: '"I just need a spark."',
            B: '"Maybe tomorrow will feel different."',
            C: '"I feel disconnected from everything."'
          }
        }
      ]
    },
    content: {
      key: 'content',
      emoji: '🙂',
      name: 'CONTENT',
      description: 'I feel calm, balanced, or steady.',
      questions: [
        {
          question: 'What helps you sustain this balance?',
          options: {
            A: 'I know what grounds me and use it.',
            B: 'I enjoy the calm but don\'t think about maintaining it.',
            C: 'I fear it\'ll fade soon.'
          }
        },
        {
          question: 'How are you using your calmness today?',
          options: {
            A: 'Channeling it into something meaningful.',
            B: 'Taking it easy and staying low-key.',
            C: 'Not doing much — just drifting.'
          }
        },
        {
          question: 'What\'s in your mind right now?',
          options: {
            A: 'Gratitude or quiet focus.',
            B: '"I hope this feeling stays."',
            C: '"I don\'t feel much, just existing."'
          }
        }
      ]
    },
    cheerful: {
      key: 'cheerful',
      emoji: '😄',
      name: 'CHEERFUL',
      description: 'I\'m upbeat and playful.',
      questions: [
        {
          question: 'What\'s fueling your joy today?',
          options: {
            A: 'Gratitude or connection.',
            B: 'Random good vibe.',
            C: 'Not sure — it just happened.'
          }
        },
        {
          question: 'When you\'re happy, do you share it?',
          options: {
            A: 'Yes — I love spreading it.',
            B: 'Sometimes — if I have time.',
            C: 'Not really — I keep it private.'
          }
        },
        {
          question: 'What runs through your mind right now?',
          options: {
            A: '"I want to make someone\'s day."',
            B: '"This feels good, I\'ll enjoy it."',
            C: '"Hope this doesn\'t fade soon."'
          }
        }
      ]
    },
    loving: {
      key: 'loving',
      emoji: '🥰',
      name: 'LOVING',
      description: 'I feel connected, kind, or grateful.',
      questions: [
        {
          question: 'What\'s bringing this warmth today?',
          options: {
            A: 'Someone or something meaningful.',
            B: 'Just a general good vibe.',
            C: 'Not sure, it\'s random.'
          }
        },
        {
          question: 'How do you handle this emotional warmth?',
          options: {
            A: 'I share it or express it.',
            B: 'I hold it quietly.',
            C: 'I distract myself before it fades.'
          }
        },
        {
          question: 'What feels true in your mind now?',
          options: {
            A: '"I want to nurture this."',
            B: '"I want to remember this."',
            C: '"It probably won\'t last."'
          }
        }
      ]
    }
  };

  const moods = [
    { key: 'sad', emoji: '😢', name: 'SAD' },
    { key: 'neutral', emoji: '😐', name: 'NEUTRAL' },
    { key: 'content', emoji: '🙂', name: 'CONTENT' },
    { key: 'cheerful', emoji: '😄', name: 'CHEERFUL' },
    { key: 'loving', emoji: '🥰', name: 'LOVING' }
  ];

  // Load all habits
  const loadAllHabits = async () => {
    try {
      console.log('📊 Dashboard: Loading ALL habit types...');
      
      const email = await UserSessionService.getCurrentUserEmail();
      if (email) {
        setUsername(email.split('@')[0]);
      }
      
      // 1. Load ALL goals from GoalsService
      const userGoals = await GoalsService.getUserGoals();
      
      console.log('📊 Dashboard: All user goals loaded:', userGoals.length);
      console.log('   All goals:', userGoals.map(g => ({
        title: g.title,
        description: g.description,
        category: g.category,
        targetDate: g.targetDate
      })));
      
      // 2. Filter MOOD ASSESSMENT habits (from mood assessment flow)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const moodHabits = userGoals.filter(goal => {
        // Check if it's a mood habit
        if (goal.category === 'Mood Assessment') {
          console.log('   Found Mood Assessment habit:', goal.description);
          if (goal.targetDate) {
            const goalDate = new Date(goal.targetDate);
            goalDate.setHours(0, 0, 0, 0);
            const matches = goalDate.getTime() === today.getTime();
            console.log(`     Target date: ${goalDate.toISOString()}, Today: ${today.toISOString()}, Matches: ${matches}`);
            return matches;
          } else {
            // If no targetDate, show all mood habits (backwards compatibility)
            console.log('     No targetDate, showing anyway');
            return true;
          }
        }
        return false;
      });
      
      console.log('✅ Loaded MOOD ASSESSMENT habits:', moodHabits.length);
      console.log('   Mood habits list:', moodHabits);
      
      // 3. Load CONFIGURED habits (from Quiz Hub → ActionPicker → GoalConfigurationScreen)
      const configuredHabits = userGoals.filter(goal => 
        goal.category && 
        goal.category !== 'Mood Assessment' &&
        goal.category !== 'Custom Habits' // Filter out this category, will add to custom section
      );
      
      // 4. Load Custom Habits (from Dashboard → ActionPicker)
      const customHabits = userGoals.filter(goal => 
        goal.category === 'Custom Habits' || 
        goal.category === 'Custom'
      );
      
      // Combine configured and custom habits
      const allConfiguredHabits = [...configuredHabits, ...customHabits];
      
      console.log('✅ Loaded CONFIGURED habits:', configuredHabits.length);
      console.log('✅ Loaded CUSTOM habits:', customHabits.length);
      console.log('   Configured habits:', configuredHabits);
      console.log('   Custom habits:', customHabits);
      
      // Combine all types: mood habits + configured habits + custom habits
      const allHabits = [...moodHabits, ...allConfiguredHabits];
      
      console.log('📋 Total habits to display:', allHabits.length);
      console.log('   Final habits list:', allHabits.map(h => h.title || h.description));
      
      setGoals(allHabits);
    } catch (error) {
      console.error('❌ Error loading all habits:', error);
    }
  };

  // Load quiz scores for display
  const loadQuizScores = async () => {
    try {
      const mindfulness = await UserDataService.getQuizScore('Mindfulness');
      const purposeful = await UserDataService.getQuizScore('Purposefulness');
      const empathy = await UserDataService.getQuizScore('Empathy & Philanthropy');
      
      setMindfulnessScore(mindfulness || 0);
      setPurposefulnessScore(purposeful || 0);
      setEmpathyScore(empathy || 0);
      
      // Calculate Leadership Score as AVERAGE of all 3 quizzes
      const allScores = [mindfulness || 0, purposeful || 0, empathy || 0];
      const totalScore = allScores.reduce((sum, score) => sum + score, 0);
      const averageScore = Math.round(totalScore / 3); // Average of 3 quizzes
      setLeadershipScore(averageScore);
      
      console.log('📊 Quiz Scores:', {
        mindfulness: mindfulness || 0,
        purposeful: purposeful || 0,
        empathy: empathy || 0,
        total: totalScore,
        leadershipScore: averageScore,
        calculation: `(${mindfulness} + ${purposeful} + ${empathy}) / 3 = ${averageScore}%`
      });
    } catch (error) {
      console.error('Error loading quiz scores:', error);
    }
  };

  const handleMoodSelection = (moodKey) => {
    // Reset all previous state to ensure fresh start
    setShowRecommendations(false);
    setAssessmentResults(null);
    setSelectedMoodData(null);
    
    const moodIndex = moods.findIndex(m => m.key === moodKey);
    setSelectedMood(moodIndex);
    
    // Get complete mood data from MoodAssessmentService (includes habits)
    const fullMoodData = MoodAssessmentService.moodData[moodKey];
    setSelectedMoodData(fullMoodData);
    
    // Small delay to ensure state is cleared before opening modal
    setTimeout(() => {
      setShowMoodAssessment(true);
    }, 50);
  };

  // Handle completing morning bundle
  const handleCompleteMorningBundle = () => {
    setShowMorningBundle(false);
    // TEMPORARY: Afternoon bundle paused for testing
    // checkAndShowAfternoonBundle();
  };

  // Handle completing afternoon bundle
  const handleCompleteAfternoonBundle = () => {
    setShowAfternoonBundle(false);
    // Check if evening bundle should be shown
    checkAndShowEveningBundle();
  };

  // Handle completing evening bundle
  const handleCompleteEveningBundle = () => {
    setShowEveningBundle(false);
  };

  // Check if afternoon bundle should be shown
  const checkAndShowAfternoonBundle = async () => {
    try {
      const userEmail = await UserSessionService.getCurrentUserEmail();
      if (userEmail) {
        // Check if morning bundle was completed today
        const lastMorningBundleDate = await UserSessionService.getAsyncStorageItem(`morning_bundle_${userEmail}`);
        const today = new Date().toDateString();
        
        if (lastMorningBundleDate === today) {
          // Check if afternoon bundle already shown today
          const lastAfternoonBundleDate = await UserSessionService.getAsyncStorageItem(`afternoon_bundle_${userEmail}`);
          const currentHour = new Date().getHours();
          
          // Show afternoon bundle if:
          // 1. It's afternoon (12 PM or later)
          // 2. Morning bundle was completed today
          // 3. Afternoon bundle hasn't been shown today
          if (currentHour >= 12 && lastAfternoonBundleDate !== today) {
            // TEMPORARY: Always show for testing (remove this after testing)
            setShowAfternoonBundle(true);
          }
        }
      }
    } catch (error) {
      console.error('Error checking afternoon bundle:', error);
    }
  };

  useEffect(() => {
    loadAllHabits();
    loadQuizScores();
    loadWaterData();
    checkAndShowMorningBundle();
  }, []);

  // Check if user should see morning bundle
  const checkAndShowMorningBundle = async () => {
    try {
      const userEmail = await UserSessionService.getCurrentUserEmail();
      if (userEmail) {
        // PAUSED: Morning bundle disabled per user request
        // setShowMorningBundle(true);
        // setShowAfternoonBundle(true);
        // setShowEveningBundle(true);
      }
    } catch (error) {
      console.error('Error checking morning bundle:', error);
    }
  };

  // Check if evening bundle should be shown
  const checkAndShowEveningBundle = async () => {
    try {
      const userEmail = await UserSessionService.getCurrentUserEmail();
      if (userEmail) {
        // Check if afternoon bundle was completed today
        const lastAfternoonBundleDate = await UserSessionService.getAsyncStorageItem(`afternoon_bundle_${userEmail}`);
        const today = new Date().toDateString();
        
        if (lastAfternoonBundleDate === today) {
          // Check if evening bundle already shown today
          const lastEveningBundleDate = await UserSessionService.getAsyncStorageItem(`evening_bundle_${userEmail}`);
          const currentHour = new Date().getHours();
          
          // Show evening bundle if:
          // 1. It's evening (6 PM or later)
          // 2. Afternoon bundle was completed today
          // 3. Evening bundle hasn't been shown today
          if (currentHour >= 18 && lastEveningBundleDate !== today) {
            setShowEveningBundle(true);
          }
        }
      }
    } catch (error) {
      console.error('Error checking evening bundle:', error);
    }
  };

  // Refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAllHabits();
      loadQuizScores();
      loadWaterData();
    });
    return unsubscribe;
  }, [navigation]);

  // Animated Checkbox Component - Visual Only (No Touch Handler)
  const AnimatedCheckbox = ({ isChecked }) => {
    const checkboxScale = useRef(new Animated.Value(1)).current;
    const checkmarkScale = useRef(new Animated.Value(0)).current;
    const checkboxRotate = useRef(new Animated.Value(0)).current;
    const backgroundColor = useRef(new Animated.Value(isChecked ? 1 : 0)).current;

    useEffect(() => {
      // Smooth animation when checkbox state changes
      Animated.parallel([
        Animated.spring(checkmarkScale, {
          toValue: isChecked ? 1 : 0,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundColor, {
          toValue: isChecked ? 1 : 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.spring(checkboxScale, {
            toValue: 0.85,
            friction: 5,
            tension: 200,
            useNativeDriver: true,
          }),
          Animated.spring(checkboxScale, {
            toValue: 1,
            friction: 4,
            tension: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(checkboxRotate, {
          toValue: isChecked ? 1 : 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }, [isChecked]);

    const bgColor = backgroundColor.interpolate({
      inputRange: [0, 1],
      outputRange: ['#FFF', '#20C997'], // White to green
    });

    const borderColor = backgroundColor.interpolate({
      inputRange: [0, 1],
      outputRange: ['#E5E7EB', '#20C997'], // Gray to green
    });

    const rotateInterpolate = checkboxRotate.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        style={[
          styles.animatedCheckbox,
          {
            backgroundColor: bgColor,
            borderColor: borderColor,
            transform: [
              { scale: checkboxScale },
              { rotate: rotateInterpolate },
            ],
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ scale: checkmarkScale }],
          }}
        >
          <Ionicons name="checkmark" size={14} color="#FFF" />
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#17A085" 
        translucent={false}
      />
      {/* Title Bar with Solid Light Green */}
      <View style={styles.titleBar}>
        <View style={styles.headerContainer}>
          {/* Left Side - Logo and User */}
          <View style={styles.headerLeft}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>RDM</Text>
            </View>
            <View style={styles.userSection}>
              <Text style={styles.usernameText}>User</Text>
              <View style={styles.userLevelBar}>
                <View style={styles.userLevelFill} />
              </View>
            </View>
          </View>
          
          {/* Right Side - Icons */}
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIconButton}>
              <Ionicons name="person-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconButton}>
              <Ionicons name="menu" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const currentScrollY = event.nativeEvent.contentOffset.y;
          
          // Hide when scrolling down, show when scrolling up
          if (currentScrollY > scrollY.current && currentScrollY > 50) {
            if (isBottomBarVisible) setIsBottomBarVisible(false);
          } else if (currentScrollY < scrollY.current || currentScrollY < 100) {
            if (!isBottomBarVisible) setIsBottomBarVisible(true);
          }
          
          scrollY.current = currentScrollY;
        }}
        scrollEventThrottle={16}
      >
        {/* Daily Bundles Section - Horizontal Scroll */}
        <View style={styles.dailyBundlesSection}>
          <View style={styles.bundlesHeader}>
            <Text style={styles.bundlesTitle}>My Daily Journey</Text>
            <Text style={styles.bundlesSwipeHint}>Swipe →</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.bundlesScrollView}
            contentContainerStyle={styles.bundlesScrollContent}
          >
            {/* Morning Bundle */}
            <TouchableOpacity 
              style={[styles.bundleCard, styles.morningBundle]}
              onPress={() => setShowMorningBundle(true)}
            >
              <View style={styles.bundleHeaderSimple}>
                <Text style={styles.bundleEmojiMain}>☀️</Text>
                <View style={styles.bundleTitleContainer}>
                  <Text style={styles.bundleTitleSimple}>Morning Warmup</Text>
                  <Text style={styles.bundleTimeSimple}>6-10 AM</Text>
                </View>
              </View>
              <View style={styles.bundleContentSimple}>
                <Text style={styles.bundleItemSimple}>• Quote / 1-min video</Text>
                <Text style={styles.bundleItemSimple}>• Puzzle + 2 Quizzes</Text>
                <Text style={styles.bundleItemSimple}>• 2-min Meditation</Text>
              </View>
              <TouchableOpacity style={styles.bundleMoreButtonSimple}>
                <Text style={styles.bundleMoreTextSimple}>More</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Afternoon Bundle */}
            <TouchableOpacity 
              style={[styles.bundleCard, styles.afternoonBundle]}
              onPress={() => setShowAfternoonBundle(true)}
            >
              <View style={styles.bundleHeaderSimple}>
                <Text style={styles.bundleEmojiMain}>⛅</Text>
                <View style={styles.bundleTitleContainer}>
                  <Text style={styles.bundleTitleSimple}>Afternoon Booster</Text>
                  <Text style={styles.bundleTimeSimple}>1-3 PM</Text>
                </View>
              </View>
              <View style={styles.bundleContentSimple}>
                <Text style={styles.bundleItemSimple}>• One Joke</Text>
                <Text style={styles.bundleItemSimple}>• One Puzzle</Text>
                <Text style={styles.bundleItemSimple}>• Focus Video</Text>
              </View>
              <TouchableOpacity style={styles.bundleMoreButtonSimple}>
                <Text style={styles.bundleMoreTextSimple}>More</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Evening Bundle */}
            <TouchableOpacity 
              style={[styles.bundleCard, styles.eveningBundle]}
              onPress={() => setShowEveningBundle(true)}
            >
              <View style={styles.bundleHeaderSimple}>
                <Text style={styles.bundleEmojiMain}>🌙</Text>
                <View style={styles.bundleTitleContainer}>
                  <Text style={styles.bundleTitleSimple}>Evening Winddown</Text>
                  <Text style={styles.bundleTimeSimple}>6-9 PM</Text>
                </View>
              </View>
              <View style={styles.bundleContentSimple}>
                <Text style={styles.bundleItemSimple}>• Reflection prompt</Text>
                <Text style={styles.bundleItemSimple}>• Gratitude journal</Text>
                <Text style={styles.bundleItemSimple}>• Sleep meditation</Text>
              </View>
              <TouchableOpacity style={styles.bundleMoreButtonSimple}>
                <Text style={styles.bundleMoreTextSimple}>More</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Personal Dashboard Section */}
        <View style={styles.personalDashboardSection}>
          <Text style={styles.sectionTitle}>My Dashboard</Text>
          
          {/* Metrics Grid - 3x2 Compact & Magical */}
          <View style={styles.metricsGridCompact}>
            {/* Top Row */}
            <View style={styles.metricsRow}>
              <MiniMetricCard icon="🎯" label="Goals" value="7/10" color="#20C997" delay={0} onPress={() => {}} />
              <TouchableOpacity 
                onPress={() => navigation.navigate('CustomHabits')}
                style={styles.miniMetricWrapper}
              >
                <View style={styles.miniMetricCard}>
                  <Text style={styles.miniMetricIcon}>✅</Text>
                  <Text style={styles.miniMetricLabel}>HABITS</Text>
                  <Ionicons name="arrow-forward-circle" size={20} color="#1A202C" />
                  <View style={[styles.miniAccent, { backgroundColor: '#8B5CF6' }]} />
                </View>
              </TouchableOpacity>
              <MiniMetricCard icon="🔥" label="Streak" value="12d" color="#EC4899" delay={100} onPress={() => {}} />
            </View>
            
            {/* Bottom Row */}
            <View style={styles.metricsRow}>
              <MiniMetricCard icon="💎" label="Tokens" value="245" color="#2196F3" delay={150} onPress={() => {}} />
              <MiniMetricCard icon="❤️" label="Charity" value="60" color="#EF4444" delay={200} onPress={() => navigation.navigate('Donate')} />
              <MiniMetricCard icon="🌱" label="CO₂" value="32kg" color="#10B981" delay={250} onPress={() => {}} />
            </View>
          </View>

          {/* Goal Meter & Portfolio - Side by Side */}
          <View style={styles.goalMeterPortfolioContainer}>
            {/* Goal Meter - Left Card */}
            <View style={styles.goalMeterCard}>
              <Text style={styles.goalMeterTitle}>Goal Meter</Text>
              <Text style={styles.goalMeterDate}>Wednesday, Sep 24</Text>
              <View style={styles.goalMeterBars}>
                {[
                  { value: 10, height: 42 },
                  { value: 11, height: 36 },
                  { value: 12, height: 30 },
                  { value: 13, height: 55, isHighlighted: true },
                  { value: 14, height: 38 },
                  { value: 15, height: 44 },
                  { value: 16, height: 42 }
                ].map((item, index) => (
                  <View key={index} style={styles.goalMeterBarColumn}>
                    <View style={styles.goalMeterBarContainer}>
                      <View 
                        style={[
                          styles.goalMeterBar,
                          { 
                            height: item.height,
                            backgroundColor: item.isHighlighted ? '#20C997' : '#E5E7EB'
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.goalMeterLabel}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Portfolio - Right Card - Clean Simple Design */}
            <LinearGradient
              colors={['#20C997', '#17A085', '#14B8A6']}
              style={styles.portfolioCard}
            >
              {/* Top Row: Folder Icon & Toggle */}
              <View style={styles.portfolioHeader}>
                <View style={styles.portfolioIconCircle}>
                  <Ionicons name="folder-outline" size={20} color="#FFFFFF" />
                </View>
                
                <TouchableOpacity 
                  style={styles.portfolioToggle}
                  onPress={() => setPortfolioCurrency(portfolioCurrency === 'USDT' ? 'RDM' : 'USDT')}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.portfolioToggleOption,
                    portfolioCurrency === 'USDT' && styles.portfolioToggleOptionActive
                  ]}>USDT</Text>
                  <Text style={[
                    styles.portfolioToggleOption,
                    portfolioCurrency === 'RDM' && styles.portfolioToggleOptionActive
                  ]}>RDM</Text>
                </TouchableOpacity>
              </View>

              {/* Center Content */}
              <View style={styles.portfolioContent}>
                <Text style={styles.portfolioLabel}>PORTFOLIO</Text>
                <Text style={styles.portfolioValue}>
                  {portfolioValue.toFixed(2)}
                </Text>
                <Text style={styles.portfolioCurrency}>
                  {portfolioCurrency}
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Leadership Score - Enhanced Interactive */}
          <TouchableOpacity 
            style={styles.leadershipScoreCard}
            onPress={handleCheckScore}
            activeOpacity={0.8}
          >
            <View style={styles.leadershipScoreGradient}>
              <View style={styles.leadershipScoreHeader}>
                <View style={styles.leadershipScoreIconContainer}>
                  <Ionicons name="trophy" size={28} color="#F59E0B" />
                </View>
                <View style={styles.leadershipScoreTitleContainer}>
                  <Text style={styles.leadershipScoreTitle}>Leadership Score</Text>
                  <Text style={styles.leadershipScoreSubtitle}>Tap to view details</Text>
                </View>
                <View style={styles.leadershipScorePercentage}>
                  <Text style={styles.leadershipScoreValue}>{leadershipScore}%</Text>
                </View>
              </View>
              <View style={styles.leadershipScoreBarContainer}>
                <View style={[styles.leadershipScoreBarFill, { width: `${leadershipScore}%` }]} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Goals and Habits - Premium Design */}
          <View style={styles.goalsHabitsSection}>
            {/* Goals Column */}
            <View style={styles.goalsColumn}>
              <View style={styles.columnHeaderProfessional}>
                <Ionicons name="flag" size={16} color="#1A202C" />
                <Text style={styles.columnTitleProfessional}>Goals</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.goalItemEnhanced}
                activeOpacity={0.7}
                onPress={() => toggleGoal('water')}
              >
                <View style={[styles.iconCircleGoal, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="water" size={22} color="#2196F3" />
                </View>
                <Text style={styles.goalTextEnhanced}>3L Water</Text>
                <AnimatedCheckbox isChecked={checkedGoals.water} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.goalItemEnhanced}
                activeOpacity={0.7}
                onPress={() => toggleGoal('project')}
              >
                <View style={[styles.iconCircleGoal, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="briefcase" size={22} color="#FF9800" />
                </View>
                <Text style={styles.goalTextEnhanced}>Project Update</Text>
                <AnimatedCheckbox isChecked={checkedGoals.project} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.goalItemEnhanced}
                activeOpacity={0.7}
                onPress={() => toggleGoal('reading')}
              >
                <View style={[styles.iconCircleGoal, { backgroundColor: '#F3E5F5' }]}>
                  <Ionicons name="book" size={22} color="#9C27B0" />
                </View>
                <Text style={styles.goalTextEnhanced}>30m Reading</Text>
                <AnimatedCheckbox isChecked={checkedGoals.reading} />
              </TouchableOpacity>

              {/* Custom Goals Button */}
              <TouchableOpacity 
                style={styles.customButtonEnhanced}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('CustomHabits')}
              >
                <View style={styles.customButtonLeft}>
                  <View style={[styles.iconCircleCustom, { backgroundColor: '#F0FDF9', borderColor: 'rgba(32, 201, 151, 0.3)' }]}>
                    <Ionicons name="add-circle" size={20} color="#20C997" />
                  </View>
                  <Text style={styles.customButtonText}>Custom Goals</Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={20} color="#20C997" />
              </TouchableOpacity>
            </View>

            {/* Habits Column */}
            <View style={styles.habitsColumn}>
              <View style={styles.columnHeaderProfessional}>
                <Ionicons name="checkmark-circle" size={16} color="#1A202C" />
                <Text style={styles.columnTitleProfessional}>Habits</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.habitItemEnhanced}
                activeOpacity={0.7}
                onPress={() => toggleHabit('meditate')}
              >
                <View style={styles.habitLeft}>
                  <View style={[styles.iconCircleHabit, { backgroundColor: '#E8F5E9' }]}>
                    <Ionicons name="body" size={22} color="#4CAF50" />
                  </View>
                  <Text style={styles.habitTextEnhanced}>2-min Meditate</Text>
                </View>
                <AnimatedCheckbox isChecked={checkedHabits.meditate} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.habitItemEnhanced}
                activeOpacity={0.7}
                onPress={() => toggleHabit('steps')}
              >
                <View style={styles.habitLeft}>
                  <View style={[styles.iconCircleHabit, { backgroundColor: '#FFF3E0' }]}>
                    <Ionicons name="walk" size={22} color="#FF9800" />
                  </View>
                  <Text style={styles.habitTextEnhanced}>5k Steps</Text>
                </View>
                <AnimatedCheckbox isChecked={checkedHabits.steps} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.habitItemEnhanced}
                activeOpacity={0.7}
                onPress={() => toggleHabit('sugar')}
              >
                <View style={styles.habitLeft}>
                  <View style={[styles.iconCircleHabit, { backgroundColor: '#FCE4EC' }]}>
                    <Ionicons name="leaf" size={22} color="#E91E63" />
                  </View>
                  <Text style={styles.habitTextEnhanced}>No Sugar</Text>
                </View>
                <AnimatedCheckbox isChecked={checkedHabits.sugar} />
              </TouchableOpacity>

              {/* Custom Habits Button */}
              <TouchableOpacity 
                style={styles.customButtonEnhanced}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('CustomHabits')}
              >
                <View style={styles.customButtonLeft}>
                  <View style={[styles.iconCircleCustom, { backgroundColor: '#F3E8FF', borderColor: 'rgba(139, 92, 246, 0.3)' }]}>
                    <Ionicons name="add-circle" size={20} color="#8B5CF6" />
                  </View>
                  <Text style={styles.customButtonText}>Custom Habits</Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={20} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Wallets & Charity Section - Reimagined */}
        <View style={styles.walletsCharitySection}>
          <View style={styles.sectionHeaderEnhanced}>
            <Ionicons name="wallet" size={24} color="#20C997" />
            <Text style={styles.sectionTitleEnhanced}>Wallets & Charity</Text>
          </View>
          
          {/* Wallet Cards - Outline Style */}
          <TouchableOpacity style={[styles.walletCardOutline, { borderColor: '#20C997' }]} activeOpacity={0.8}>
            <View style={styles.walletHeader}>
              <View style={styles.walletIconCircle}>
                <Text style={styles.walletEmojiLarge}>💎</Text>
              </View>
              <View style={styles.walletInfo}>
                <Text style={[styles.walletTitleOutline, { color: '#20C997' }]}>Reward Wallet</Text>
                <Text style={styles.walletBalanceOutline}>Balance: 150 RDM</Text>
              </View>
              <TouchableOpacity style={[styles.walletMoreButtonOutline, { backgroundColor: '#20C997' }]}>
                <Text style={styles.walletMoreTextOutline}>More</Text>
                <Ionicons name="chevron-forward" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.walletCardOutline, { borderColor: '#FFA726' }]} activeOpacity={0.8}>
            <View style={styles.walletHeader}>
              <View style={styles.walletIconCircle}>
                <Text style={styles.walletEmojiLarge}>🤔</Text>
              </View>
              <View style={styles.walletInfo}>
                <Text style={[styles.walletTitleOutline, { color: '#FFA726' }]}>Remorse Wallet</Text>
                <Text style={styles.walletBalanceOutline}>Balance: 35 RDM</Text>
              </View>
              <TouchableOpacity style={[styles.walletMoreButtonOutline, { backgroundColor: '#FFA726' }]}>
                <Text style={styles.walletMoreTextOutline}>More</Text>
                <Ionicons name="chevron-forward" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.walletCardOutline, { borderColor: '#6366F1' }]} activeOpacity={0.8}>
            <View style={styles.walletHeader}>
              <View style={styles.walletIconCircle}>
                <Text style={styles.walletEmojiLarge}>❤️</Text>
              </View>
              <View style={styles.walletInfo}>
                <Text style={[styles.walletTitleOutline, { color: '#6366F1' }]}>Charity Wallet</Text>
                <Text style={styles.walletBalanceOutline}>Donated: 60 RDM</Text>
              </View>
              <TouchableOpacity style={[styles.walletMoreButtonOutline, { backgroundColor: '#6366F1' }]}>
                <Text style={styles.walletMoreTextOutline}>More</Text>
                <Ionicons name="chevron-forward" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Charity Impact - Enhanced */}
          <View style={styles.charityImpactEnhanced}>
            <View style={styles.charityImpactHeader}>
              <Ionicons name="heart-circle" size={22} color="#EC4899" />
              <Text style={styles.charityImpactTitleEnhanced}>Charity Impact</Text>
            </View>
            
            <TouchableOpacity style={styles.charityItemEnhanced} activeOpacity={0.7}>
              <View style={[styles.charityIconCircle, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="school" size={20} color="#2196F3" />
              </View>
              <Text style={styles.charityItemTextEnhanced}>Sponsored Supplies</Text>
              <Text style={styles.charityItemRDM}>15 RDM</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.charityItemEnhanced} activeOpacity={0.7}>
              <View style={[styles.charityIconCircle, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="leaf" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.charityItemTextEnhanced}>Tree Plantation</Text>
              <Text style={styles.charityItemRDM}>20 RDM</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.charityItemEnhanced} activeOpacity={0.7}>
              <View style={[styles.charityIconCircle, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="fast-food" size={20} color="#FF9800" />
              </View>
              <Text style={styles.charityItemTextEnhanced}>Community Meals</Text>
              <Text style={styles.charityItemRDM}>25 RDM</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BottomNavigationBar navigation={navigation} currentRoute="Dashboard" isVisible={isBottomBarVisible} />

      {/* Mood Assessment Modal - key ensures fresh start for each mood */}
      <MoodAssessmentScreen
        key={`mood-assessment-${selectedMoodData?.key || 'none'}`}
        visible={showMoodAssessment}
        onClose={() => {
          setShowMoodAssessment(false);
          // Don't set selectedMoodData to null here - we need it for recommendations modal
        }}
        moodData={selectedMoodData}
        navigation={navigation}
        onAssessmentComplete={(results) => {
          setAssessmentResults(results);
          setShowMoodAssessment(false);
          setShowRecommendations(true);
        }}
      />

      {/* Habit Recommendations Modal */}
      <MoodHabitRecommendationsModal
        visible={showRecommendations}
        onClose={() => {
          setShowRecommendations(false);
          setAssessmentResults(null);
          setSelectedMoodData(null); // Now we can clear it
          setSelectedMood(null); // Reset selected mood
        }}
        moodData={selectedMoodData}
        assessmentResults={assessmentResults}
        navigation={navigation}
      />

      {/* Habit Options Modal */}
      <HabitOptionsModal
        visible={showHabitOptions}
        habit={selectedHabit}
        onModify={handleModifyFromOptions}
        onDelete={handleDeleteFromOptions}
        onClose={() => {
          setShowHabitOptions(false);
          setTimeout(() => setSelectedHabit(null), 300);
        }}
      />

      {/* Modify Habit Modal */}
      {modifyHabitVisible && habitToModify && (
        <HabitModifyModal
          visible={modifyHabitVisible}
          habit={habitToModify}
          newText={modifiedHabitText}
          onTextChange={setModifiedHabitText}
          onSave={handleSaveModifiedHabit}
          onClose={() => {
            setModifyHabitVisible(false);
            setHabitToModify(null);
            setModifiedHabitText('');
          }}
        />
      )}

      {/* Morning Bundle Modal */}
      <MorningBundleModal
        visible={showMorningBundle}
        username={username}
        onComplete={handleCompleteMorningBundle}
        onClose={() => setShowMorningBundle(false)}
      />

      {/* Afternoon Bundle Modal */}
      <AfternoonBundleModal
        visible={showAfternoonBundle}
        username={username}
        onComplete={handleCompleteAfternoonBundle}
        onClose={() => setShowAfternoonBundle(false)}
      />

      {/* Evening Bundle Modal */}
      <EveningBundleModal
        visible={showEveningBundle}
        username={username}
        onComplete={handleCompleteEveningBundle}
        onClose={() => setShowEveningBundle(false)}
      />

      {/* Water Tracking Modal */}
      <Modal
        visible={showWaterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWaterModal(false)}
      >
        <View style={styles.waterModalOverlay}>
          <View style={styles.waterModalContainer}>
            {/* Header */}
            <View style={styles.waterModalHeader}>
              <View style={styles.waterModalTitleRow}>
                <Text style={styles.waterModalIcon}>💧</Text>
                <View>
                  <Text style={styles.waterModalTitle}>Track Your Hydration</Text>
                  <Text style={styles.waterModalSubtitle}>Stay healthy and energized</Text>
                </View>
              </View>
               <TouchableOpacity onPress={() => setShowWaterModal(false)} style={styles.waterCloseButton}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Water Tracking Section */}
              <View style={styles.waterTrackingSection}>
                {/* Section Title */}
                <View style={styles.waterSectionTitle}>
                  <Ionicons name="water" size={20} color="#2196F3" />
                  <Text style={styles.waterSectionLabel}>Drinking Water</Text>
                </View>

                {/* Glass and Stats Side by Side */}
                <View style={styles.waterDisplayRow}>
                  {/* Glass Progress Visual */}
                  <View style={styles.waterGlassContainer}>
                    <View style={styles.waterGlass}>
                      <View style={[styles.waterFill, { height: `${(waterGlasses / WATER_GOAL) * 100}%` }]} />
                    </View>
                  </View>
                  
                  {/* Stats Beside Glass */}
                  <View style={styles.waterStatsContainer}>
                    <Text style={styles.waterGoalText}>DAILY GOAL: {WATER_GOAL} GLASSES (3L)</Text>
                    <Text style={styles.waterProgressText}>
                      {waterGlasses} / {WATER_GOAL}
                    </Text>
                    <Text style={styles.waterProgressLabel}>Glasses</Text>
                  </View>
                </View>

                {/* Controls */}
                <View style={styles.waterControls}>
                 <TouchableOpacity 
                   style={styles.waterControlButton}
                   onPress={removeWaterGlass}
                 >
                   <Ionicons name="remove" size={22} color="#FFF" />
                 </TouchableOpacity>
                 
                 <View style={styles.waterControlCenter}>
                   <Text style={styles.waterControlText}>250ml / 1 glass</Text>
                 </View>
                 
                 <TouchableOpacity 
                   style={styles.waterControlButton}
                   onPress={addWaterGlass}
                 >
                   <Ionicons name="add" size={22} color="#FFF" />
                 </TouchableOpacity>
                </View>

                {/* Stay Hydrated Message */}
                <View style={styles.waterMessageContainer}>
                  <Ionicons name="water" size={16} color="#2196F3" />
                  <Text style={styles.waterMessageText}>Stay hydrated!</Text>
                  <View style={styles.waterProgressBar}>
                    <View style={[styles.waterProgressBarFill, { width: `${(waterGlasses / WATER_GOAL) * 100}%` }]} />
                  </View>
                </View>
              </View>

              {/* Disclaimer Box */}
              <View style={styles.waterDisclaimerBox}>
                <Ionicons name="information-circle" size={18} color="#8B5CF6" />
                <Text style={styles.waterDisclaimerText}>
                  Complete your 3L water goal to boost your profile and earn coins! 
                  Incomplete goals won't affect your progress positively.
                </Text>
                <Ionicons name="trending-up" size={14} color="#8B5CF6" />
              </View>

              {/* Action Button */}
              <TouchableOpacity 
                style={styles.waterActionButton}
                onPress={() => setShowWaterModal(false)}
              >
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
                <Text style={styles.waterActionButtonText}>
                  {waterGlasses >= WATER_GOAL ? 'Goal Completed! ✓' : 'Continue tracking'}
                </Text>
                {waterGlasses < WATER_GOAL && (
                  <Text style={styles.waterActionEmoji}>💪</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Habit Options Modal Component
const HabitOptionsModal = ({ visible, habit, onModify, onDelete, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.habitOptionsOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.habitOptionsContainer} 
          activeOpacity={1}
        >
          {/* Close Button */}
          <TouchableOpacity 
            style={styles.habitOptionsCloseButton}
            onPress={onClose}
          >
            <Ionicons name="close-circle" size={28} color="#CBD5E0" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.habitOptionsHeader}>
            <View style={styles.habitOptionsIconContainer}>
              <Ionicons name="options-outline" size={24} color="#20C997" />
            </View>
            <Text style={styles.habitOptionsTitle}>Habit Options</Text>
            <Text style={styles.habitOptionsSubtitle}>
              What would you like to do with this habit?
            </Text>
          </View>

          {/* Habit Preview */}
          {habit && (
            <View style={styles.habitPreviewCard}>
              <View style={styles.habitPreviewIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#20C997" />
              </View>
              <View style={styles.habitPreviewText}>
                <Text 
                  style={styles.habitPreviewTitle} 
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {habit.title || habit.description}
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons - Side by Side */}
          <View style={styles.habitOptionsActions}>
            <TouchableOpacity 
              style={styles.habitOptionModifyButton}
              onPress={onModify}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={26} color="#FFF" />
              <Text style={styles.habitOptionModifyButtonLabel}>Modify</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.habitOptionDeleteButton} 
              onPress={onDelete}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={26} color="#FFF" />
              <Text style={styles.habitOptionDeleteButtonLabel}>Delete</Text>
            </TouchableOpacity>
          </View>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Habit Modify Modal Component
const HabitModifyModal = ({ visible, habit, newText, onTextChange, onSave, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modifyModalOverlay}>
        <View style={styles.modifyModalContainer}>
          <Text style={styles.modifyModalTitle}>Modify Habit</Text>
          <TextInput
            style={styles.modifyModalInput}
            value={newText}
            onChangeText={onTextChange}
            multiline
            numberOfLines={4}
            placeholder="Enter habit description..."
          />
          <View style={styles.modifyModalButtons}>
            <TouchableOpacity style={styles.modifyModalCancelButton} onPress={onClose}>
              <Text style={styles.modifyModalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modifyModalSaveButton} onPress={onSave}>
              <Text style={styles.modifyModalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Helper Components
const EmptyHabitsState = () => (
  <View style={styles.emptyState}>
    <LinearGradient
      colors={['#20C997', '#17A085']}
      style={styles.emptyStateIcon}
    >
      <MaterialIcons name="flag" size={40} color="#FFF" />
    </LinearGradient>
    <Text style={styles.emptyStateTitle}>No Habits Yet</Text>
    <Text style={styles.emptyStateText}>
      Create your first habit to start your mindful journey.
    </Text>
    <View style={styles.emptyStateQuote}>
      <Text style={styles.emptyStateQuoteText}>
        "Arise, Awake, and stop not till the habit is formed"
      </Text>
    </View>
  </View>
);

const HabitsList = ({ habits, onHabitLongPress }) => (
  <View>
    {habits.map((habit) => (
      <HabitCard 
        key={habit.id} 
        habit={habit} 
        onLongPress={onHabitLongPress}
      />
    ))}
  </View>
);

const HabitCard = ({ habit, onLongPress }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Determine if this is a configured habit or mood assessment habit
  const isMoodHabit = habit.category === 'Mood Assessment';
  
  // Get habit name based on type
  const habitName = isMoodHabit 
    ? (habit.description || 'Mood Habit')
    : (habit.title || habit.habitName || 'Unknown Habit');
  
  // Get metadata based on type
  const metadata = isMoodHabit 
    ? `Frequency: ${habit.frequency || 'Daily'} • RDM: ${habit.pledgeAmount || 1}`
    : `Frequency: ${habit.activityFrequency || 'Daily'} • Reflections: ${habit.reflections || 'Everyday'} • RDM: ${habit.pledgeRdm || 1}`;
  
  return (
    <TouchableOpacity 
      style={styles.habitCard}
      onPress={() => setIsExpanded(!isExpanded)}
      onLongPress={() => onLongPress(habit)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['#20C997', '#17A085']}
        style={styles.habitIcon}
      >
        <Ionicons name="checkmark-circle" size={20} color="#FFF" />
      </LinearGradient>
      <View style={styles.habitDetails}>
        <Text 
          style={styles.habitName} 
          numberOfLines={isExpanded ? undefined : 2}
          ellipsizeMode="tail"
        >
          {habitName}
        </Text>
        <Text style={styles.habitMeta}>{metadata}</Text>
      </View>
      <View style={styles.habitStatus} />
    </TouchableOpacity>
  );
};

const QuizScoreItem = ({ title, score, icon, color }) => (
  <View style={styles.quizScoreItem}>
    <View style={[styles.quizScoreIconContainer, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <View style={styles.quizScoreDetails}>
      <Text style={styles.quizScoreTitle}>{title}</Text>
      <View style={styles.quizScoreBarContainer}>
        <View style={[styles.quizScoreBar, { width: `${score}%`, backgroundColor: color }]} />
      </View>
    </View>
    <Text style={[styles.quizScorePercentage, { color }]}>{score}%</Text>
  </View>
);

// Mini Metric Card - Compact with Magical Micro-Interactions
const MiniMetricCard = ({ icon, label, value, color, delay, onPress }) => {
  const scale = useRef(new Animated.Value(0.7)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance with bounce
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      ]).start();

      // Subtle continuous pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.03,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, delay);
  }, []);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.93,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(iconRotate, {
        toValue: -15,
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
        tension: 180,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(iconRotate, {
          toValue: 15,
          tension: 150,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(iconRotate, {
          toValue: 0,
          tension: 120,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      if (onPress) onPress();
    });
  };

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 60],
  });

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.miniMetricWrapper}
    >
      <Animated.View
        style={[
          styles.miniMetricCard,
          {
            transform: [
              { scale: Animated.multiply(scale, pulse) },
            ],
          },
        ]}
      >
        {/* Shimmer overlay */}
        <Animated.View
          style={[
            styles.miniShimmer,
            {
              opacity: shimmer.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0.3, 0],
              }),
              transform: [{ translateX: shimmerTranslate }],
            },
          ]}
        />
        
        {/* Animated Icon */}
        <Animated.View
          style={{
            transform: [
              { rotate: iconRotate.interpolate({
                inputRange: [-15, 15],
                outputRange: ['-15deg', '15deg'],
              })},
            ],
          }}
        >
          <Text style={styles.miniMetricIcon}>{icon}</Text>
        </Animated.View>
        
        {/* Label */}
        <Text style={styles.miniMetricLabel}>{label}</Text>
        
        {/* Value with black color */}
        <Text style={styles.miniMetricValue}>{value}</Text>
        
        {/* Color accent bar at bottom */}
        <View style={[styles.miniAccent, { backgroundColor: color }]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

// Animated Mood Card Component with Psychology-Based Design
const MoodCardAnimated = ({ moods, selectedMood, handleMoodSelection }) => {
  const [emojiAnimations] = useState(() =>
    moods.map(() => ({
      scale: new Animated.Value(0.8),
      pulse: new Animated.Value(1),
      rotate: new Animated.Value(0),
      glow: new Animated.Value(0),
    }))
  );

  useEffect(() => {
    // Sequential blinking color animation (one-time on mount)
    moods.forEach((mood, index) => {
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(emojiAnimations[index].glow, {
            toValue: 1,
            duration: 180,
            useNativeDriver: false,
          }),
          Animated.timing(emojiAnimations[index].glow, {
            toValue: 0,
            duration: 180,
            useNativeDriver: false,
          }),
        ]).start();
      }, index * 180);
    });

    // Staggered entrance animation
    moods.forEach((mood, index) => {
      Animated.spring(emojiAnimations[index].scale, {
        toValue: 1,
        tension: 100,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Continuous subtle breathing animation for unselected moods
      if (selectedMood !== index) {
        const animateBreathing = () => {
          Animated.sequence([
            Animated.timing(emojiAnimations[index].pulse, {
              toValue: 1.06,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(emojiAnimations[index].pulse, {
              toValue: 1,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]).start(() => animateBreathing());
        };
        animateBreathing();
      }
    });
  }, [selectedMood]);

  const handleMoodPress = (moodKey, index) => {
    // Premium bounce effect with rotation on selection
    Animated.parallel([
      Animated.sequence([
        Animated.spring(emojiAnimations[index].scale, {
          toValue: 1.4,
          tension: 300,
          friction: 2,
          useNativeDriver: true,
        }),
        Animated.spring(emojiAnimations[index].scale, {
          toValue: 1.2,
          tension: 200,
          friction: 4,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(emojiAnimations[index].rotate, {
          toValue: -1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(emojiAnimations[index].rotate, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(emojiAnimations[index].rotate, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    handleMoodSelection(moodKey);
  };

  return (
    <Animated.View style={styles.moodCardAnimated}>
      <LinearGradient
        colors={['#E6FCF5', '#FFFFFF', '#F0FDF8']}
        style={styles.moodCardGradient}
      >
        <View style={styles.moodCardHeader}>
          <Text style={styles.moodTitle}>How are you feeling today?</Text>
        </View>

        <View style={styles.moodIconsContainerAnimated}>
          {moods.map((mood, index) => {
            const isSelected = selectedMood === index;
            const rotate = emojiAnimations[index].rotate.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            });
            
            const opacityStyle = {
              transform: [
                { scale: isSelected ? emojiAnimations[index].scale : Animated.multiply(emojiAnimations[index].scale, emojiAnimations[index].pulse) },
              ],
            };

            const glowStyle = {
              opacity: emojiAnimations[index].glow,
            };

            return (
              <TouchableOpacity
                key={mood.key}
                activeOpacity={0.8}
                onPress={() => handleMoodPress(mood.key, index)}
                style={styles.moodIconWrapper}
              >
                <Animated.View
                  style={[
                    styles.moodIconAnimated,
                    isSelected && styles.moodIconSelectedAnimated,
                    opacityStyle,
                  ]}
                >
                  <Text style={styles.moodEmojiAnimated}>{mood.emoji}</Text>
                  {isSelected && (
                    <>
                      <View style={styles.selectedRing} />
                      <View style={styles.selectedRingInner} />
                      <View style={styles.selectedGlow} />
                    </>
                  )}
                </Animated.View>
                <Animated.View
                  style={[
                    styles.moodIconGlowOverlay,
                    glowStyle,
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // Clean Professional Header
  titleBar: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#20C997',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // iOS-Inspired Glass Header
  glassHeaderContainer: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  glassHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logoBox: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#20C997',
    letterSpacing: -0.5,
  },
  // Premium User Section
  userSection: {
    flexDirection: 'column',
    gap: 4,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  usernameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  userLevelBar: {
    width: 100,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  userLevelFill: {
    width: '65%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  // Premium Right Side Icons
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconButton: {
    padding: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  taglineContainer: {
    alignItems: 'center',
    paddingTop: 4,
  },
  titleBarContent: {
    alignItems: 'center',
    marginTop: 8,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.2,
  },
  titleText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  logoWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoR: {
    fontSize: 28,
    fontWeight: '900',
    color: '#20C997',
    letterSpacing: -1,
  },
  logoBracket: {
    position: 'absolute',
    top: -2,
    left: -6,
    right: -4,
    bottom: -2,
    borderRadius: 2,
    borderWidth: 2.5,
    borderColor: '#20C997',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  logoDM: {
    fontSize: 28,
    fontWeight: '900',
    color: '#20C997',
    letterSpacing: -1,
  },
  // Legacy styles for backwards compatibility
  logoGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 14,
  },
  logoText: {
    color: '#20C997',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 1,
  },
  username: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    padding: 4,
  },
  iconBackground: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  menuIcon: {
    fontWeight: '900',
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 160,
    backgroundColor: '#F8F9FA',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  goalMeterCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5F7F3',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#20C997',
    marginBottom: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  progressBarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: 16,
    borderRadius: 5,
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 10,
    color: '#20C997',
    fontWeight: '700',
  },
  portfolioCard: {
    flex: 1,
    borderRadius: 16,
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 0,
  },
  portfolioGradient: {
    padding: 16,
    paddingTop: 14,
    paddingBottom: 18,
    flex: 1,
    justifyContent: 'space-between',
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  usdtLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  usdtLabelText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleSwitchButton: {
    width: 50,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchSlider: {
    width: '50%',
    height: '100%',
    borderRadius: 10,
  },
  portfolioTitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    marginTop: 0,
    letterSpacing: 0.8,
  },
  portfolioAmount: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  moodCardAnimated: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  moodCardGradient: {
    padding: 18,
    paddingTop: 16,
    paddingBottom: 20,
  },
  moodCardHeader: {
    marginBottom: 6,
    alignItems: 'center',
  },
  moodTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A202C',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  moodIconsContainerAnimated: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 12,
  },
  moodIconWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  moodIconAnimated: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.5,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  moodIconSelectedAnimated: {
    backgroundColor: '#20C997',
    borderColor: '#20C997',
    borderWidth: 3,
    shadowColor: '#20C997',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  moodEmojiAnimated: {
    fontSize: 34,
    zIndex: 10,
  },
  selectedRing: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.5,
    borderColor: 'rgba(32, 201, 151, 0.3)',
    pointerEvents: 'none',
  },
  selectedRingInner: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  selectedGlow: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#20C997',
    opacity: 0.15,
    top: -4,
    left: -4,
  },
  moodIconGlowOverlay: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#20C997',
    borderWidth: 2.5,
    borderColor: '#20C997',
    top: 0,
    left: 0,
    zIndex: 5,
  },
  moodCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  moodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  moodIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodIconSelected: {
    backgroundColor: '#4FD1C7',
    borderColor: '#4FD1C7',
  },
  moodEmoji: {
    fontSize: 24,
  },
  basePurseCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  basePurseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  basePurseText: {
    marginLeft: 12,
  },
  basePurseAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  basePurseLabel: {
    fontSize: 12,
    color: '#808080',
    fontWeight: '500',
  },
  basePurseButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  topUpButton: {
    backgroundColor: '#20C997',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topUpText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  withdrawButton: {
    backgroundColor: '#D0D0D0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  withdrawText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  morePurseCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  morePurseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  morePurseText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  checkScoreButton: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  checkScoreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
  },
  checkScoreIcon: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkScoreContent: {
    flex: 1,
    marginLeft: 16,
  },
  checkScoreTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  checkScoreSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  customHabitsSection: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 20,
  },
  customHabitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customHabitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  addHabitButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#20C997',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addHabitButtonText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#808080',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateQuote: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  emptyStateQuoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#808080',
    textAlign: 'center',
  },
  habitCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  habitDetails: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  habitMeta: {
    fontSize: 12,
    color: '#808080',
  },
  habitStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#20C997',
    alignSelf: 'center',
  },
  aiCustomHabitButton: {
    backgroundColor: '#20C997',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  aiCustomHabitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  quizScoresSection: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 32,
  },
  quizScoresHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  quizScoresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  viewAllText: {
    color: '#20C997',
    fontSize: 14,
    fontWeight: '600',
  },
  quizScoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingVertical: 4,
  },
  quizScoreIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quizScoreDetails: {
    flex: 1,
  },
  quizScoreTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 6,
  },
  quizScoreBarContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  quizScoreBar: {
    height: '100%',
    borderRadius: 2,
  },
  quizScorePercentage: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 12,
    minWidth: 40,
  },
  // Modify Habit Modal Styles
  modifyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modifyModalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modifyModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 16,
  },
  modifyModalInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1A202C',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modifyModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modifyModalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  modifyModalCancelText: {
    color: '#4A5568',
    fontSize: 16,
    fontWeight: '600',
  },
  modifyModalSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#20C997',
    alignItems: 'center',
  },
  modifyModalSaveText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Habit Options Modal Styles
  habitOptionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitOptionsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: '75%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
    position: 'relative',
  },
  habitOptionsCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  habitOptionsHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  habitOptionsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  habitOptionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 6,
  },
  habitOptionsSubtitle: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 18,
  },
  habitPreviewCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  habitPreviewIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E6FFF9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  habitPreviewText: {
    flex: 1,
  },
  habitPreviewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3748',
    lineHeight: 18,
  },
  habitOptionsActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  habitOptionModifyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#20C997',
    paddingVertical: 14,
    borderRadius: 14,
    minHeight: 64,
    gap: 4,
  },
  habitOptionModifyButtonLabel: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 0,
  },
  habitOptionButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 2,
  },
  habitOptionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  habitOptionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  habitOptionDeleteButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    borderRadius: 14,
    minHeight: 64,
    gap: 4,
  },
  habitOptionDeleteButtonLabel: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 0,
  },
  // Make your own AI custom Habit button styles
  makeOwnHabitButtonWrapper: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  makeOwnHabitButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  makeOwnHabitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  // Daily Bundles Section Styles
  dailyBundlesSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  bundlesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bundlesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
  },
  bundlesSwipeHint: {
    fontSize: 14,
    fontWeight: '600',
    color: '#20C997',
  },
  bundlesScrollView: {
    marginHorizontal: -16,
  },
  bundlesScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  bundleCard: {
    width: 220,
    borderRadius: 18,
    padding: 16,
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  morningBundle: {
    backgroundColor: '#FFF',
  },
  afternoonBundle: {
    backgroundColor: '#FFF',
  },
  eveningBundle: {
    backgroundColor: '#FFF',
  },
  bundleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  bundleEmoji: {
    fontSize: 28,
  },
  bundleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  bundleTime: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
  },
  bundleContent: {
    marginBottom: 12,
  },
  bundleItem: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFF',
    marginBottom: 4,
  },
  bundleMoreButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  bundleMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  // Personal Dashboard Section Styles
  personalDashboardSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 16,
  },
  // Compact 3x2 Grid Styles
  metricsGridCompact: {
    marginBottom: 20,
    gap: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  miniMetricWrapper: {
    flex: 1,
  },
  miniMetricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    overflow: 'hidden',
  },
  miniShimmer: {
    position: 'absolute',
    top: 0,
    left: -30,
    width: 60,
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  miniMetricIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  miniMetricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  miniMetricValue: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
    color: '#1A202C',
  },
  miniAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  // Goal Meter & Portfolio Container
  goalMeterPortfolioContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  // Goal Meter Card (Left)
  goalMeterCard: {
    flex: 1,
    minHeight: 125,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    paddingTop: 8,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: 'space-between',
  },
  goalMeterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 1,
  },
  goalMeterDate: {
    fontSize: 9,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  goalMeterBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 65,
    gap: 2,
  },
  goalMeterBarColumn: {
    flex: 1,
    alignItems: 'center',
  },
  goalMeterBarContainer: {
    width: '100%',
    height: 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  goalMeterBar: {
    width: '100%',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    minHeight: 18,
  },
  goalMeterLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#1A202C',
    marginTop: 5,
  },
  // Portfolio Card (Right) - Clean Simple Design
  portfolioCard: {
    width: 135,
    minHeight: 125,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    justifyContent: 'space-between',
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  portfolioIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    padding: 2,
    alignItems: 'center',
    gap: 2,
  },
  portfolioToggleOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 9.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.2,
    borderRadius: 8,
    minWidth: 36,
    textAlign: 'center',
  },
  portfolioToggleOptionActive: {
    backgroundColor: '#FFFFFF',
    color: '#20C997',
  },
  portfolioContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  portfolioLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: 1.3,
    marginBottom: 8,
  },
  portfolioValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.2,
    lineHeight: 32,
  },
  portfolioCurrency: {
    fontSize: 10.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 3,
    letterSpacing: 0.3,
  },
  // Leadership Score - Glassmorphism Professional
  leadershipScoreCard: {
    marginBottom: 20,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  leadershipScoreGradient: {
    padding: 20,
    borderRadius: 18,
  },
  leadershipScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 14,
  },
  leadershipScoreIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  leadershipScoreTitleContainer: {
    flex: 1,
  },
  leadershipScoreTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A202C',
    marginBottom: 3,
    letterSpacing: -0.4,
  },
  leadershipScoreSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.2,
  },
  leadershipScorePercentage: {
    backgroundColor: '#F0FDF9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#20C997',
  },
  leadershipScoreValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#20C997',
    letterSpacing: -0.6,
  },
  leadershipScoreBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  leadershipScoreBarFill: {
    height: '100%',
    backgroundColor: '#20C997',
    borderRadius: 4,
  },
  // Goals and Habits - Premium Styles
  goalsHabitsSection: {
    flexDirection: 'row',
    gap: 14,
  },
  goalsColumn: {
    flex: 1,
  },
  habitsColumn: {
    flex: 1,
  },
  columnHeaderWithGradient: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  columnHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  columnTitleWhite: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  // Professional Black & White Headers
  columnHeaderProfessional: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  columnTitleProfessional: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A202C',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  // Enhanced Goal Item
  goalItemEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircleGoal: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalTextEnhanced: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A202C',
    flex: 1,
  },
  goalStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#20C997',
  },
  // Enhanced Habit Item
  habitItemEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircleHabit: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitTextEnhanced: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A202C',
    flex: 1,
  },
  // Custom Goals/Habits Buttons - Professional
  customButtonEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 10,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  customButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircleCustom: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1.5,
  },
  customButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    flex: 1,
    letterSpacing: 0.2,
  },
  habitCheckboxChecked: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#20C997',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  animatedCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  habitCheckboxUncheckedEnhanced: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#CBD5E0',
  },
  // Wallets & Charity - Premium Enhanced Styles
  walletsCharitySection: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionHeaderEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitleEnhanced: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A202C',
    letterSpacing: -0.3,
  },
  // Enhanced Wallet Cards
  walletCardEnhanced: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  walletGradient: {
    borderRadius: 16,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(148,163,184,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(148,163,184,0.2)',
  },
  walletEmojiLarge: {
    fontSize: 22,
  },
  walletInfo: {
    flex: 1,
  },
  walletTitleEnhanced: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  walletBalanceEnhanced: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  walletMoreButtonEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  walletMoreTextEnhanced: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  // Outline Wallet Cards
  walletCardOutline: {
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  walletTitleOutline: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  walletBalanceOutline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  walletMoreButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 3,
  },
  walletMoreTextOutline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Enhanced Charity Impact
  charityImpactEnhanced: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  charityImpactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  charityImpactTitleEnhanced: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A202C',
    letterSpacing: -0.2,
  },
  charityItemEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  charityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  charityItemTextEnhanced: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A202C',
    flex: 1,
  },
  charityItemRDM: {
    fontSize: 12,
    fontWeight: '800',
    color: '#20C997',
    backgroundColor: '#E6FCF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  // Mood Assessment Section Styles (TOP)
  moodAssessmentSectionTop: {
    marginBottom: 16,
    backgroundColor: '#E6FCF5',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  moodSectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 12,
    textAlign: 'center',
  },
  // Professional UI/UX Bundle Styles
  bundleHeaderSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  bundleEmojiMain: {
    fontSize: 44,
    marginRight: 6,
  },
  bundleTitleContainer: {
    flex: 1,
  },
  bundleTitleSimple: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  bundleTimeSimple: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  bundleContentSimple: {
    marginBottom: 10,
  },
  bundleItemSimple: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 4,
    lineHeight: 17,
    paddingLeft: 4,
  },
  bundleMoreButtonSimple: {
    backgroundColor: '#F0FDF9',
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#20C997',
  },
  bundleMoreTextSimple: {
    fontSize: 13,
    fontWeight: '800',
    color: '#20C997',
    letterSpacing: 0.5,
  },
   // Water Tracking Modal Styles - Compact & Premium
   waterModalOverlay: {
     flex: 1,
     backgroundColor: 'rgba(0,0,0,0.6)',
     justifyContent: 'center',
     alignItems: 'center',
     padding: 20,
   },
   waterModalContainer: {
     backgroundColor: '#FFF',
     borderRadius: 28,
     width: '95%',
     maxWidth: 400,
     maxHeight: '68%',
     shadowColor: '#20C997',
     shadowOffset: { width: 0, height: 12 },
     shadowOpacity: 0.35,
     shadowRadius: 24,
     elevation: 20,
   },
  waterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    paddingBottom: 14,
    backgroundColor: '#F8FFFE',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#E0F2EE',
  },
  waterModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  waterModalIcon: {
    fontSize: 32,
  },
  waterModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A202C',
    letterSpacing: -0.4,
  },
  waterModalSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#20C997',
    marginTop: 1,
  },
  waterCloseButton: {
    padding: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterTrackingSection: {
    padding: 18,
    paddingBottom: 14,
  },
  waterSectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  waterSectionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A202C',
    letterSpacing: -0.3,
  },
  waterDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 16,
  },
  waterGlassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterGlass: {
    width: 52,
    height: 86,
    borderWidth: 3.5,
    borderColor: '#2196F3',
    borderRadius: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: '#E3F2FD',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  waterFill: {
    width: '100%',
    backgroundColor: '#2196F3',
    opacity: 0.7,
  },
  waterStatsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  waterGoalText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  waterProgressText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#2196F3',
    letterSpacing: -1.3,
    lineHeight: 44,
  },
  waterProgressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  waterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  waterControlButton: {
    backgroundColor: '#20C997',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  waterControlCenter: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0F2EE',
  },
  waterControlText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A202C',
    letterSpacing: 0.2,
  },
  waterMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  waterMessageText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2196F3',
  },
  waterProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 3,
    overflow: 'hidden',
  },
  waterProgressBarFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 3,
  },
  waterDisclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F3E8FF',
    padding: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  waterDisclaimerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#7C3AED',
    lineHeight: 16,
  },
  waterActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#20C997',
    marginHorizontal: 18,
    marginBottom: 18,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  waterActionButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.4,
  },
  waterActionEmoji: {
    fontSize: 16,
  },
});
