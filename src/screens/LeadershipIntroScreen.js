import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { UserSessionService } from '../services/UserSessionService';

const { width } = Dimensions.get('window');

export default function LeadershipIntroScreen({ navigation }) {
  useEffect(() => {
    // Mark user as returning so they don't see this intro again
    UserSessionService.markUserAsReturning();
  }, []);

  const handleContinue = () => {
    navigation.replace('QuizLanding');
  };

  const handleSkip = () => {
    // Don't force users to Dashboard, just let them stay on intro
    // They can click the button when ready
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon with growth bars */}
        <View style={styles.iconContainer}>
          <View style={styles.barContainer}>
            <View style={[styles.bar, styles.bar1]} />
            <View style={[styles.bar, styles.bar2]} />
            <View style={[styles.bar, styles.bar3]} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Discover your Leadership Profile</Text>

        {/* Quote Box */}
        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>
            "The greatest tragedy in life is not failure, but settling for mediocrity when greatness lies within your reach. Every moment you delay discovering your true leadership potential is a moment stolen from your destiny."
          </Text>
        </View>

        {/* Quiz Intro */}
        <Text style={styles.quizIntro}>
          Take a quick quiz across Leadership, Purposefulness, and Empathy/Philanthropy.
        </Text>

        {/* Quiz Details Label */}
        <View style={styles.detailsLabel}>
          <Text style={styles.detailsText}>10 thoughtful questions per category</Text>
        </View>

        {/* Start Button - White with green text */}
        <TouchableOpacity style={styles.startButton} onPress={handleContinue}>
          <Text style={styles.startButtonText}>Unlock Your Leadership Potential</Text>
        </TouchableOpacity>

        {/* Maybe Later */}
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Maybe later</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerIcon}>💡</Text>
        <Text style={styles.footerText}>Join thousands who discovered their leadership strengths</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    gap: 8,
  },
  bar: {
    width: 12,
    backgroundColor: '#20C997',
    borderRadius: 6,
  },
  bar1: {
    height: 20,
  },
  bar2: {
    height: 30,
  },
  bar3: {
    height: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 24,
  },
  quoteBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 22,
  },
  quizIntro: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  detailsLabel: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  detailsText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    width: '90%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#20C997',
  },
  startButtonText: {
    color: '#20C997',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    padding: 16,
    marginTop: 12,
  },
  skipText: {
    color: '#000000',
    fontSize: 14,
    opacity: 0.7,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 32,
    paddingHorizontal: 32,
  },
  footerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#000000',
    opacity: 0.7,
  },
});

