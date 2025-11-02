import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSessionService } from '../services/UserSessionService';
import UserDataService from '../services/UserDataService';
import { GeminiService } from '../services/GeminiService';

export default function QuizHubScreen({ navigation }) {
  const [mindfulnessScore, setMindfulnessScore] = useState(0);
  const [purposefulnessScore, setPurposefulnessScore] = useState(0);
  const [empathyScore, setEmpathyScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [improvements, setImprovements] = useState({
    Mindfulness: [],
    Purposefulness: [],
    'Empathy & Philanthropy': [],
  });
  const [loadingImprovements, setLoadingImprovements] = useState({
    Mindfulness: false,
    Purposefulness: false,
    'Empathy & Philanthropy': false,
  });

  useEffect(() => {
    loadQuizScores();
  }, []);

  // Refresh scores when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadQuizScores();
    });

    return unsubscribe;
  }, [navigation]);

  // Load improvements when scores are loaded
  useEffect(() => {
    if (!loading) {
      loadImprovements();
    }
  }, [loading]);

  const loadQuizScores = async () => {
    try {
      const email = await UserSessionService.getCurrentUserEmail();
      
      if (email) {
        // Use UserDataService (temporary backend) to get scores
        const mindfulness = await UserDataService.getQuizScore('Mindfulness', email);
        const purposefulness = await UserDataService.getQuizScore('Purposefulness', email);
        const empathy = await UserDataService.getQuizScore('Empathy & Philanthropy', email);
        
        setMindfulnessScore(mindfulness);
        setPurposefulnessScore(purposefulness);
        setEmpathyScore(empathy);
        
        console.log('✅ Quiz scores loaded:', { mindfulness, purposefulness, empathy });
      } else {
        console.log('No user email found');
      }
    } catch (error) {
      console.error('Error loading quiz scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (category) => {
    try {
      // Check if user is signed up
      const isSignedUp = await UserSessionService.isCurrentUserSignedIn();
      
      if (isSignedUp) {
        // User is signed up - navigate to quiz screen
        navigation.navigate('Quiz', { category });
      } else {
        // User NOT signed up - go to Leadership Intro first
        navigation.navigate('LeadershipIntro');
      }
    } catch (error) {
      console.error('Error checking sign-in status:', error);
      navigation.navigate('LeadershipIntro');
    }
  };

  const handleStartNewQuiz = () => {
    navigation.navigate('QuizLanding');
  };

  const handleBackToDashboard = () => {
    navigation.navigate('Dashboard');
  };

  const loadImprovements = async () => {
    loadImprovementsForCategory('Mindfulness', '#20C997');
    loadImprovementsForCategory('Purposefulness', '#6C63FF');
    loadImprovementsForCategory('Empathy & Philanthropy', '#FF6B6B');
  };

  const loadImprovementsForCategory = async (category, color) => {
    try {
      setLoadingImprovements(prev => ({ ...prev, [category]: true }));
      
      const email = await UserSessionService.getCurrentUserEmail();
      if (!email) {
        setLoadingImprovements(prev => ({ ...prev, [category]: false }));
        return;
      }

      const score = await UserDataService.getQuizScore(category, email);
      
      // Only load improvements if there's a score
      if (score === 0) {
        setImprovements(prev => ({ ...prev, [category]: [] }));
        setLoadingImprovements(prev => ({ ...prev, [category]: false }));
        return;
      }

      // Get detailed responses (currently simulated)
      const detailedResponses = await UserDataService.getDetailedQuizResponses(category, email);
      
      // For now, use temporary mock data to ensure content shows
      const tempImprovements = [
        'Pause, breathe, observe.',
        'Connect to what truly matters.',
        'Listen deeply, without judgment.'
      ];
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setImprovements(prev => ({ ...prev, [category]: tempImprovements }));
      
      // Try to get real improvements from Gemini (but don't wait if it fails)
      try {
        if (detailedResponses.length > 0) {
          const weakAreas = detailedResponses
            .filter(response => response.answer <= 3)
            .sort((a, b) => a.answer - b.answer)
            .slice(0, 3);
          
          if (weakAreas.length > 0) {
            const suggestions = await GeminiService.getImprovementSuggestions(category, weakAreas);
            // Update with real AI suggestions
            setImprovements(prev => ({ ...prev, [category]: suggestions }));
          }
        }
      } catch (aiError) {
        console.log('AI suggestions unavailable, using temp data');
        // Keep the temporary improvements already set
      }
      
    } catch (error) {
      console.error('Error loading improvements:', error);
      // Use fallback improvements
      const fallback = GeminiService._generateFallbackImprovements(category);
      setImprovements(prev => ({ ...prev, [category]: fallback }));
    } finally {
      setLoadingImprovements(prev => ({ ...prev, [category]: false }));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#20C997" />
        <Text style={styles.loadingText}>Loading Quiz Hub...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#2D3748" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz Hub</Text>
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>1-5 scale</Text>
            <View style={styles.debugFlag}>
              <Text style={styles.debugFlagText}>DEBUG</Text>
            </View>
          </View>
        </View>

        {/* Main Quiz Hub Card */}
        <View style={styles.mainCard}>
          <Text style={styles.mainTitle}>Quiz Hub</Text>
          <Text style={styles.mainSubtitle}>Track your progress and improve</Text>
        </View>

        {/* Your Progress Section */}
        <Text style={styles.sectionHeader}>Your Progress</Text>

        {/* Mindfulness Card */}
        <QuizCategoryCard
          title="Mindfulness"
          category="Mindfulness"
          score={mindfulnessScore}
          iconName="self-improvement"
          color="#20C997"
          onPress={() => handleStartQuiz('mindfulness')}
          improvements={improvements.Mindfulness}
          loadingImprovements={loadingImprovements.Mindfulness}
          navigation={navigation}
        />

        {/* Purposefulness Card */}
        <QuizCategoryCard
          title="Purposefulness"
          category="Purposefulness"
          score={purposefulnessScore}
          iconName="flag"
          color="#6C63FF"
          onPress={() => handleStartQuiz('purposefulness')}
          improvements={improvements.Purposefulness}
          loadingImprovements={loadingImprovements.Purposefulness}
          navigation={navigation}
        />

        {/* Empathy & Philanthropy Card */}
        <QuizCategoryCard
          title="Empathy & Philanthropy"
          category="Empathy & Philanthropy"
          score={empathyScore}
          iconName="favorite"
          color="#FF6B6B"
          onPress={() => handleStartQuiz('empathy')}
          improvements={improvements['Empathy & Philanthropy']}
          loadingImprovements={loadingImprovements['Empathy & Philanthropy']}
          navigation={navigation}
        />

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.startNewQuizButton} onPress={handleStartNewQuiz}>
            <Text style={styles.startNewQuizText}>Start New Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backToDashboardButton} onPress={handleBackToDashboard}>
            <Text style={styles.backToDashboardText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const QuizCategoryCard = ({ title, category, score, iconName, color, onPress, improvements = [], loadingImprovements = false, navigation }) => {
  const hasScore = score > 0;

  const handleCardPress = () => {
    // Navigate to quiz - works for both Start and Retake
    onPress();
  };

  return (
    <View style={styles.quizCardContainer}>
      <TouchableOpacity 
        style={styles.quizCard} 
        onPress={handleCardPress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <MaterialIcons name={iconName} size={24} color={color} />
        </View>
        
        <View style={styles.quizContent}>
          <Text style={styles.quizTitle}>{title}</Text>
          <View style={styles.quizProgress}>
            <Text style={[styles.quizScore, { color: hasScore ? color : '#666' }]}>
              {score}%
            </Text>
            <Text style={styles.quizStatus}>
              {hasScore ? 'Completed' : 'Not Started'}
            </Text>
          </View>
        </View>
        
        <View style={[styles.startButton, { backgroundColor: color }]}>
          <Text style={styles.startButtonText}>{hasScore ? 'Retake' : 'Start'}</Text>
        </View>
      </TouchableOpacity>

      {/* Always Show: Areas of Improvement + Enhance Button for completed quizzes */}
      {hasScore && (
        <View style={styles.expandableContent}>
          <ImprovementSection
            improvements={improvements}
            color={color}
            loading={loadingImprovements}
          />
          
          {/* Enhance Your Daily Routine Button */}
          <TouchableOpacity 
            style={styles.enhanceRoutineButtonInside} 
            onPress={async () => {
              try {
                console.log('🔍 QuizHub: Button clicked for category:', category);
                
                // Get user email
                const email = await UserSessionService.getCurrentUserEmail();
                
                if (!email) {
                  Alert.alert('Error', 'Please sign in to view recommendations.');
                  return;
                }
                
                // Get habits with priority - returns NEW array (immutable)
                const habitsWithPriority = await UserDataService.getHabitsWithPriority(category, email);
                
                console.log('📊 habitsWithPriority count:', habitsWithPriority.length);
                console.log('📊 habitsWithPriority:', habitsWithPriority);
                
                if (habitsWithPriority && habitsWithPriority.length > 0) {
                  // Navigate with the NEW array
                  console.log('✅ Navigating to ActionPicker with', habitsWithPriority.length, 'habits');
                  navigation.navigate('ActionPicker', {
                    habitsWithPriority: habitsWithPriority, // NEW array, safe to pass
                    selectedCategory: category,
                  });
                } else {
                  console.log('⚠️ No habits found');
                  
                  // Get score to provide better error message
                  const score = await UserDataService.getQuizScore(category, email);
                  
                  if (score > 0) {
                    Alert.alert(
                      'Working on Recommendations', 
                      'Your quiz data is being processed. Please retake the quiz to ensure all responses are saved, or wait a moment and try again.'
                    );
                  } else {
                    Alert.alert('No Data', `Please complete a ${category} quiz first to get personalized recommendations.`);
                  }
                }
              } catch (error) {
                console.error('❌ Error in handleEnhanceDailyRoutine:', error);
                Alert.alert('Error', 'Failed to load habit recommendations. Please try again.');
              }
            }}
          >
            <Text style={styles.enhanceRoutineTextInside}>Enhance Your Daily Routine</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const ImprovementSection = ({ improvements, color, loading }) => {
  if (loading) {
    return (
      <View style={styles.improvementContainer}>
        <ActivityIndicator size="small" color={color} />
      </View>
    );
  }

  if (improvements.length === 0) {
    return (
      <View style={styles.improvementContainer}>
        <View style={styles.improvementHeader}>
          <MaterialIcons name="lightbulb-outline" size={20} color={color} />
          <Text style={styles.improvementTitle}>Areas for Improvement</Text>
        </View>
        <Text style={styles.emptyImprovementText}>
          Great job! No specific areas need improvement.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.improvementContainer}>
      {/* Header */}
      <View style={styles.improvementHeader}>
        <MaterialIcons name="lightbulb-outline" size={20} color={color} />
        <Text style={styles.improvementTitle}>Areas for Improvement</Text>
      </View>

      {/* AI Suggestions List */}
      <View style={styles.suggestionsList}>
        {improvements.map((improvement, index) => (
          <View key={index} style={styles.suggestionItem}>
            <View style={[styles.suggestionDot, { backgroundColor: color }]} />
            <Text style={styles.suggestionText}>{improvement}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 50,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
    marginLeft: -24,
  },
  debugContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  debugText: {
    fontSize: 10,
    color: '#4A5568',
  },
  debugFlag: {
    backgroundColor: '#E53935',
    paddingHorizontal: 8,
    paddingVertical: 2,
    transform: [{ rotate: '15deg' }],
    marginLeft: 4,
  },
  debugFlagText: {
    fontSize: 8,
    color: '#FFF',
    fontWeight: 'bold',
  },
  mainCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 224, 0.5)',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 20,
  },
  quizCardContainer: {
    marginBottom: 16,
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  expandableContent: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 16,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginTop: -12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quizContent: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  quizProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizScore: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  quizStatus: {
    fontSize: 12,
    color: '#718096',
    marginLeft: 8,
  },
  startButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonsContainer: {
    marginTop: 32,
    marginBottom: 40,
  },
  startNewQuizButton: {
    backgroundColor: '#4B5563',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  startNewQuizText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backToDashboardButton: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2D3748',
  },
  backToDashboardText: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  improvementBlock: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    padding: 16,
    marginTop: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  improvementContainer: {
    marginBottom: 0,
    paddingBottom: 0,
  },
  enhanceRoutineButtonInside: {
    backgroundColor: '#20C997',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  enhanceRoutineTextInside: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  improvementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  improvementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 6,
  },
  emptyImprovementText: {
    fontSize: 13,
    color: '#718096',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  suggestionsList: {
    marginTop: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  suggestionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 13,
    color: '#2D3748',
    lineHeight: 18,
  },
});

