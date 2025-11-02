import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSessionService } from '../services/UserSessionService';
import UserDataService from '../services/UserDataService';
import { Colors } from '../constants/Colors';
import ExplanationModal from '../components/ExplanationModal';
import CompletionModal from '../components/CompletionModal';

// MINDFULNESS QUESTIONS
const MINDFULNESS_QUESTIONS = [
  {
    heading: 'Digital Distraction Awareness',
    question: 'I check my phone or switch between tasks while someone is talking to me or when I\'m doing important work.',
    explanation: 'Staying focused improves decisions and relationships.'
  },
  {
    heading: 'Stress Response Pattern',
    question: 'When I\'m stressed or under pressure, I notice my body tensing up or my breathing getting faster.',
    explanation: 'Body awareness enables better self-regulation and leadership.'
  },
  {
    heading: 'Ego Defense Mechanism',
    question: 'When someone criticizes my work, I immediately defend myself or explain why they\'re wrong.',
    explanation: 'Openness to feedback supports continuous growth.'
  },
  {
    heading: 'Empathetic Awareness',
    question: 'I notice when people around me seem upset, stressed, or different than usual—even before they say anything.',
    explanation: 'Picking up on nonverbal cues helps prevent issues from escalating.'
  },
  {
    heading: 'Emotional Reactivity in Conflict',
    question: 'During arguments or disagreements, I speak my mind right away without taking time to understand the other person first.',
    explanation: 'A pause before reacting leads to better outcomes and relationships.'
  },
  {
    heading: 'Quality of Listening',
    question: 'While others are talking, I\'m already thinking about what I\'ll say next or what else I need to do.',
    explanation: 'Full presence builds trust and leads to better decisions.'
  },
  {
    heading: 'Work-Life Boundary Consciousness',
    question: 'I check work emails or think about work during personal time, meals, or right before sleeping.',
    explanation: 'Boundaries preserve focus and reduce burnout.'
  },
  {
    heading: 'Mindful Response Choice',
    question: 'When something makes me angry or frustrated, I pause to notice how I\'m feeling before reacting.',
    explanation: 'Noticing emotion enables responses aligned with your values.'
  },
  {
    heading: 'Compassionate Self-Talk',
    question: 'When I mess up or fail at something, I\'m really hard on myself instead of being kind and understanding.',
    explanation: 'Self-kindness builds psychological safety for your team.'
  },
  {
    heading: 'Values-Aligned Prioritization',
    question: 'I spend time on things that don\'t really matter to me or match what I believe is important.',
    explanation: 'Aligning choices with values improves effectiveness and satisfaction.'
  },
];

// PURPOSEFULNESS QUESTIONS
const PURPOSEFULNESS_QUESTIONS = [
  {
    heading: 'Purpose-First Planning',
    question: 'At the start of your day, how often do you choose your top 1–3 priorities and protect time for them?',
    explanation: 'Anchoring to purpose reduces low-value busywork.'
  },
  {
    heading: 'Present in Meetings',
    question: 'In meetings, how often do you give full attention (no multitasking, no quick peeks at notifications) to the speaker/topic?',
    explanation: 'Presence builds trust and improves decisions.'
  },
  {
    heading: 'Name the Feeling First',
    question: 'When you feel triggered, how often do you first notice and name the emotion before deciding what to do?',
    explanation: 'Labeling emotions creates space for wiser responses.'
  },
  {
    heading: 'Ego-Light Disagreements',
    question: 'In disagreements, how often do you set aside \'being right\' and ask one clarifying question first?',
    explanation: 'Curiosity over ego accelerates problem-solving.'
  },
  {
    heading: 'Attention Reset After Distraction',
    question: 'After a distraction, how often do you notice it quickly and return to the task without self‑criticism?',
    explanation: 'Fast, kind recovery sustains deep work.'
  },
  {
    heading: 'Micro-Kindness Under Pressure',
    question: 'When you\'re stressed, how often do you still choose small acts of kindness in tone, word choice, or patience?',
    explanation: 'Compassion under pressure protects relationships and culture.'
  },
  {
    heading: 'Read the Room',
    question: 'Before giving direction, how often do you pause to sense the team\'s energy, workload, and unspoken tensions?',
    explanation: 'Situational awareness improves timing and outcomes.'
  },
  {
    heading: 'Listen to Understand',
    question: 'While someone speaks, how often do you listen without mentally rehearsing your reply?',
    explanation: 'Deep listening strengthens psychological safety.'
  },
  {
    heading: 'Constructive Self-Talk After Mistakes',
    question: 'After you make a mistake, how often is your inner voice curious and constructive rather than harsh or defensive?',
    explanation: 'Balanced self-talk supports resilience and learning.'
  },
  {
    heading: 'Clear Shutdown Ritual',
    question: 'By day\'s end, how often do you create a clear shutdown (final scan, log‑off, brief reflection) to prevent spillover stress?',
    explanation: 'Boundaries restore attention and reduce burnout.'
  },
];

// EMPATHY & PHILANTHROPY QUESTIONS
const EMPATHY_QUESTIONS = [
  {
    heading: 'Listen with Full Presence',
    question: 'In conversations, how often do you give someone your full attention and reflect back what you heard before responding?',
    explanation: 'Active listening builds trust and ensures others feel understood.'
  },
  {
    heading: 'Empathy in Disagreement',
    question: 'When you disagree, how often do you ask about the other person\'s feelings or needs before defending your view?',
    explanation: 'Empathy in conflict improves fairness and models constructive resolution.'
  },
  {
    heading: 'Notice and Check In',
    question: 'How often do you notice subtle signs that a teammate is struggling and check in with care?',
    explanation: 'Proactive care prevents isolation and strengthens psychological safety.'
  },
  {
    heading: 'Repair After Harm',
    question: 'If your words or actions hurt someone, how often do you apologize and take a concrete step to repair the impact?',
    explanation: 'Accountability and repair restore trust quickly.'
  },
  {
    heading: 'Care with Boundaries',
    question: 'When you feel emotionally stretched, how often do you show empathy while setting a clear, respectful boundary?',
    explanation: 'Balanced care prevents compassion fatigue.'
  },
  {
    heading: 'Share Credit Generously',
    question: 'When outcomes go well, how often do you actively call out others\' contributions?',
    explanation: 'Recognition counters self-centered behavior and lifts morale.'
  },
  {
    heading: 'Offer Help Beyond Role',
    question: 'How often do you volunteer your time or skills to help someone beyond your formal role?',
    explanation: 'Everyday service normalizes prosocial behavior.'
  },
  {
    heading: 'Weigh Wider Impact',
    question: 'When making work decisions, how often do you consider the impact on customers, community, and the environment?',
    explanation: 'A social-responsibility lens connects choices to broader good.'
  },
  {
    heading: 'Give Time, Skills, or Funds',
    question: 'How often do you set aside time, skills, or money for causes you genuinely care about?',
    explanation: 'Consistent giving reflects values and real impact.'
  },
  {
    heading: 'Mentor and Open Doors',
    question: 'How often do you mentor or sponsor someone with less access, actively creating opportunities for them?',
    explanation: 'Sponsorship turns empathy into structural change.'
  },
];

export default function QuizScreen({ route, navigation }) {
  const { category } = route.params;
  
  // Normalize category to match saved data format
  const getNormalizedCategory = () => {
    const normalized = category?.toLowerCase() || '';
    if (normalized === 'mindfulness') return 'Mindfulness';
    if (normalized === 'purposefulness' || normalized === 'purpose') return 'Purposefulness';
    if (normalized === 'empathy' || normalized === 'empathy & philanthropy') return 'Empathy & Philanthropy';
    return 'Mindfulness';
  };
  
  const normalizedCategory = getNormalizedCategory();
  console.log('🎯 QuizScreen: Original category:', category);
  console.log('   Normalized category for saving:', normalizedCategory);

  // Select questions based on category - normalize to lowercase
  const getQuestions = () => {
    const normalized = category?.toLowerCase() || '';
    
    switch (normalized) {
      case 'mindfulness':
        console.log('   ✓ Returning MINDFULNESS_QUESTIONS');
        return MINDFULNESS_QUESTIONS;
      case 'purposefulness':
      case 'purpose':
        console.log('   ✓ Returning PURPOSEFULNESS_QUESTIONS');
        return PURPOSEFULNESS_QUESTIONS;
      case 'empathy':
      case 'empathy & philanthropy':
      case 'empathyandphilanthropy':
        console.log('   ✓ Returning EMPATHY_QUESTIONS');
        return EMPATHY_QUESTIONS;
      default:
        console.log('   ⚠️ Unknown category, defaulting to MINDFULNESS_QUESTIONS');
        return MINDFULNESS_QUESTIONS;
    }
  };

  const questions = getQuestions();
  
  console.log(`📋 QuizScreen: Loaded ${questions.length} questions for category "${category}"`);
  const [answers, setAnswers] = useState(Array(questions.length).fill(0));
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExplanation, setSelectedExplanation] = useState({ heading: '', explanation: '' });
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState(0);

  const handleAnswerChange = (questionIndex, answer) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const showExplanation = (heading, explanation) => {
    setSelectedExplanation({ heading, explanation });
    setModalVisible(true);
  };

  const calculateScore = async () => {
    if (answers.some(answer => answer === 0)) {
      Alert.alert('Incomplete', 'Please answer all questions');
      return;
    }

    // Calculate score as percentage (answers are 1-5, so max is 5 per question)
    const totalScore = answers.reduce((sum, answer) => sum + answer, 0);
    const maxScore = answers.length * 5;
    const minScore = answers.length * 1; // Minimum possible score
    const percentage = Math.round(((totalScore - minScore) / (maxScore - minScore)) * 100);

    console.log(`📊 Quiz Score Calculation:`);
    console.log(`   Total score: ${totalScore}`);
    console.log(`   Max score: ${maxScore}`);
    console.log(`   Min score: ${minScore}`);
    console.log(`   Percentage: ${percentage}%`);
    console.log(`   Answers: ${answers.join(', ')}`);
    console.log(`   👆 This percentage reflects your answers correctly now!`);
    
    // Store the calculated score
    setCalculatedScore(percentage);

    // Check if user is signed up and handle accordingly
    try {
      const email = await UserSessionService.getCurrentUserEmail();
      const isSignedUp = email && email !== 'default_user';
      
      if (isSignedUp) {
        // User is already signed up - save score and detailed responses
        // Use normalizedCategory to ensure consistent naming
        await UserDataService.saveQuizScore(normalizedCategory, percentage, email);
        console.log('✅ Score saved for category:', normalizedCategory);
        
        // Save detailed responses for areas of improvement
        const detailedResponses = questions.map((q, index) => ({
          heading: q.heading,
          question: q.question,
          answer: answers[index],
        }));
        await UserDataService.saveDetailedQuizResponses(normalizedCategory, detailedResponses, email);
        console.log('✅ Detailed responses saved for:', normalizedCategory);
        console.log('✅ Saved score:', percentage, '%');
        console.log('✅ Answers:', answers.join(', '));
        
        // Navigate to QuizHub without showing modal
        navigation.replace('QuizHub');
        return;
      } else {
        console.log('User not signed up yet, will prompt sign up');
        // Show completion modal to prompt sign up
        setCompletionModalVisible(true);
      }
    } catch (error) {
      console.error('Error saving quiz score:', error);
      // Still show modal on error
      setCompletionModalVisible(true);
    }
  };


  const handleCompletionSignUp = async () => {
    setCompletionModalVisible(false);
    // Save score temporarily for after sign up
    await saveScoreForNewUser();
    // Navigate to SignUp with callback to QuizHub
    navigation.navigate('SignUp', { 
      returnTo: 'QuizHub',
      tempScore: { category, score: calculatedScore }
    });
  };

  const saveScoreForNewUser = async () => {
    // Store the score temporarily
    await AsyncStorage.setItem('temp_quiz_score', JSON.stringify({
      category: normalizedCategory,
      score: calculatedScore
    }));
    console.log('Temp score stored:', { category: normalizedCategory, score: calculatedScore });
    
    // Also save detailed responses temporarily
    const detailedResponses = questions.map((q, index) => ({
      heading: q.heading,
      question: q.question,
      answer: answers[index],
    }));
    await AsyncStorage.setItem('temp_quiz_responses', JSON.stringify({
      category: normalizedCategory,
      responses: detailedResponses
    }));
    console.log('Temp detailed responses stored for:', normalizedCategory);
  };

  const handleCompletionSkip = async () => {
    setCompletionModalVisible(false);
    
    // Check sign-in status
    const isSignedUp = await UserSessionService.isCurrentUserSignedIn();
    
    if (isSignedUp) {
      // User is signed up - save score and go to QuizHub
      try {
        const email = await UserSessionService.getCurrentUserEmail();
        await UserDataService.saveQuizScore(category, calculatedScore, email);
        console.log('✅ Score saved on skip for signed-in user');
      } catch (error) {
        console.error('Error saving score on skip:', error);
      }
      navigation.replace('QuizHub');
    } else {
      // User not signed up - save temporarily and go to LeadershipIntro
      await saveScoreForNewUser();
      navigation.navigate('LeadershipIntro');
    }
  };

  return (
    <View style={styles.containerWrapper}>
      <ScrollView style={styles.container}>
        {/* Rating Scale Header */}
        <View style={styles.ratingScaleHeader}>
          <LinearGradient colors={['#f8f9fa', '#ffffff']} style={styles.gradient}>
            <Text style={styles.ratingTitle}>Rate 1-5</Text>
            <View style={styles.scaleContainer}>
              <ScaleItem number="1" label="Never" color="#ef4444" />
              <ScaleItem number="2" label="Rarely" color="#f97316" />
              <ScaleItem number="3" label="Sometimes" color="#f97316" />
              <ScaleItem number="4" label="Often" color="#20C997" />
              <ScaleItem number="5" label="Always" color="#20C997" />
            </View>
          </LinearGradient>
        </View>

        {/* Questions */}
        {questions.map((question, index) => (
          <QuestionCard
            key={index}
            questionIndex={index}
            questionData={question}
            selectedAnswer={answers[index]}
            onAnswerChange={(answer) => handleAnswerChange(index, answer)}
            onShowExplanation={() => showExplanation(question.heading, question.explanation)}
          />
        ))}

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={calculateScore}>
          <LinearGradient colors={['#20C997', '#17A085']} style={styles.submitGradient}>
            <Text style={styles.submitButtonText}>Complete Assessment</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Explanation Modal */}
      <ExplanationModal
        visible={modalVisible}
        heading={selectedExplanation.heading}
        explanation={selectedExplanation.explanation}
        onClose={() => setModalVisible(false)}
      />

      {/* Completion Modal */}
      <CompletionModal
        visible={completionModalVisible}
        category={category}
        onSkip={handleCompletionSkip}
        onSignUp={handleCompletionSignUp}
      />
    </View>
  );
}

const ScaleItem = ({ number, label, color }) => (
  <View style={styles.scaleItem}>
    <View style={[styles.scaleButton, { backgroundColor: `${color}15`, borderColor: `${color}50` }]}>
      <Text style={[styles.scaleNumber, { color }]}>{number}</Text>
    </View>
    <Text style={styles.scaleLabel}>{label}</Text>
  </View>
);

const QuestionCard = ({ questionIndex, questionData, selectedAnswer, onAnswerChange, onShowExplanation }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <View style={styles.questionCard}>
      <LinearGradient colors={['#ffffff', '#f8f9fa']} style={styles.questionGradient}>
        <View style={styles.questionHeader}>
          <View style={styles.questionNumberBadge}>
            <LinearGradient colors={['#20C997', '#17A085']} style={styles.badgeGradient}>
              <Text style={styles.questionNumber}>{questionIndex + 1}</Text>
            </LinearGradient>
            <Text style={styles.questionLabel}>Question {questionIndex + 1}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.helpButton}
            onPress={onShowExplanation}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
          >
            <LinearGradient colors={['#f97316', '#ea580c']} style={[styles.helpButtonGradient, isPressed && styles.pressedButton]}>
              <Text style={styles.helpButtonText}>?</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.questionHeading}>{questionData.heading}</Text>
        <Text style={styles.questionText}>{questionData.question}</Text>

        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={styles.ratingButton}
              onPress={() => onAnswerChange(rating)}
            >
              <LinearGradient
                colors={selectedAnswer === rating ? ['#20C997', '#17A085'] : ['#ffffff', '#f8f9fa']}
                style={[styles.ratingButtonGradient, selectedAnswer === rating && styles.selectedRating]}
              >
                <Text style={[styles.ratingText, selectedAnswer === rating && styles.selectedRatingText]}>
                  {rating}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  ratingScaleHeader: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  gradient: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
  },
  ratingTitle: {
    color: '#1A202C',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 12,
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleItem: {
    flex: 1,
    alignItems: 'center',
  },
  scaleButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  scaleNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scaleLabel: {
    fontSize: 11,
    color: '#4A5568',
    fontWeight: '500',
    textAlign: 'center',
  },
  questionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  questionGradient: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeGradient: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  questionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#20C997',
  },
  helpButton: {
    borderRadius: 20,
  },
  helpButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  pressedButton: {
    transform: [{ scale: 0.95 }],
  },
  questionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A5568',
    lineHeight: 22,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  ratingButton: {
    borderRadius: 12,
  },
  ratingButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedRating: {
    borderColor: '#20C997',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A5568',
  },
  selectedRatingText: {
    color: 'white',
  },
  submitButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    borderRadius: 16,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

