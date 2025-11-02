import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function MoodAssessmentScreen({ visible, onClose, moodData, onAssessmentComplete, navigation }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const questions = moodData?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answerKey) => {
    const newAnswers = { ...selectedAnswers };
    newAnswers[currentQuestionIndex] = answerKey;
    setSelectedAnswers(newAnswers);

    // Auto-advance to next question or complete
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Assessment complete - show recommendations
        if (onAssessmentComplete) {
          // Convert answers object to array, preserving order
          const answersArray = [];
          for (let i = 0; i < questions.length; i++) {
            if (newAnswers[i]) {
              answersArray.push(newAnswers[i]);
            } else {
              // If somehow missing, log warning
              console.warn('Missing answer for question', i);
              answersArray.push('C'); // Default to C if missing
            }
          }
          console.log('Assessment complete with answers array:', answersArray);
          onAssessmentComplete({
            answers: answersArray,
            moodKey: moodData?.key,
            moodName: moodData?.name,
            moodEmoji: moodData?.emoji
          });
        }
        onClose();
      }
    }, 500);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Assessment complete - show recommendations
      if (onAssessmentComplete) {
        // Convert answers object to array, preserving order
        const answersArray = [];
        for (let i = 0; i < questions.length; i++) {
          answersArray.push(selectedAnswers[i]);
        }
        console.log('Assessment complete with answers:', answersArray);
        onAssessmentComplete({
          answers: answersArray,
          moodKey: moodData?.key,
          moodName: moodData?.name,
          moodEmoji: moodData?.emoji
        });
      }
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-outline" size={28} color="#2D3748" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {moodData?.emoji} {moodData?.name}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </Text>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` }
                ]}
              />
            </View>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Question */}
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>
                {currentQuestion?.question}
              </Text>

              {/* Options */}
              {currentQuestion &&
                Object.entries(currentQuestion.options).map(([key, value]) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.optionButton,
                        isSelected && styles.optionButtonSelected
                      ]}
                      onPress={() => handleAnswer(key)}
                    >
                      <View style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected
                      ]}>
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color="#FFF" />
                        )}
                      </View>
                      <Text style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected
                      ]}>
                        {value}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.footer}>
            {currentQuestionIndex > 0 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handlePrevious}
              >
                <Text style={styles.backButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.nextButton,
                !selectedAnswers[currentQuestionIndex] && styles.nextButtonDisabled
              ]}
              onPress={handleNext}
              disabled={!selectedAnswers[currentQuestionIndex]}
            >
              <LinearGradient
                colors={['#20C997', '#17A085']}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {currentQuestionIndex === questions.length - 1
                    ? 'Complete'
                    : 'Next'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#F0FDF4',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 28,
  },
  progressContainer: {
    padding: 20,
    backgroundColor: '#FFF',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#20C997',
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  questionCard: {
    backgroundColor: '#F8F9FA',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    lineHeight: 24,
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionButtonSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#20C997',
    borderWidth: 2,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    backgroundColor: '#20C997',
    borderColor: '#20C997',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 20,
  },
  optionTextSelected: {
    color: '#2D3748',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    gap: 10,
    backgroundColor: '#FAFCFD',
  },
  backButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: '#F7FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#4A5568',
    letterSpacing: -0.2,
  },
  nextButton: {
    flex: 2,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 8,
  },
  nextButtonText: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.3,
  },
});

