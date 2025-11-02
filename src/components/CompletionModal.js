import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function CompletionModal({ visible, category, onSkip, onSignUp }) {
  const categoryNames = {
    mindfulness: 'Mindfulness',
    purposefulness: 'Purposefulness',
    empathy: 'Empathy & Philanthropy'
  };

  const categoryIcon = {
    mindfulness: 'leaf-outline',
    purposefulness: 'target-outline',
    empathy: 'heart-outline'
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onSkip}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#20C997', '#17A085']}
              style={styles.iconGradient}
            >
              <Ionicons name="checkmark" size={48} color="#FFF" />
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={styles.title}>Assessment Complete!</Text>

          {/* Description */}
          <Text style={styles.description}>
            You've completed the {categoryNames[category]} assessment.
          </Text>

          {/* Feature List */}
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="lock-closed-outline" size={20} color="#20C997" style={styles.featureIcon} />
              <Text style={styles.featureText}>Sign in to view your detailed results</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="stats-chart-outline" size={20} color="#20C997" style={styles.featureIcon} />
              <Text style={styles.featureText}>Track your progress over time</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#20C997" style={styles.featureIcon} />
              <Text style={styles.featureText}>Access personalized insights</Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
            >
              <Text style={styles.skipButtonText}>Maybe Later</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signUpButton}
              onPress={onSignUp}
            >
              <LinearGradient
                colors={['#20C997', '#17A085']}
                style={styles.signUpGradient}
              >
                <Ionicons name="person-add-outline" size={20} color="#FFF" style={styles.signUpIcon} />
                <Text style={styles.signUpButtonText}>Sign Up to View Results</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 32,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  featuresList: {
    width: '100%',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#2D3748',
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skipButtonText: {
    color: '#4A5568',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  signUpButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  signUpGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpIcon: {
    marginRight: 8,
  },
  signUpButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

