import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserSessionService } from '../services/UserSessionService';
import { Colors } from '../constants/Colors';

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
      <LinearGradient
        colors={['#4FD1C7', '#20C997']}
        style={styles.gradient}
      >
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
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  gradient: {
    flex: 1,
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
    backgroundColor: '#20C997',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    gap: 8,
  },
  bar: {
    width: 12,
    backgroundColor: '#FFF',
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
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  quoteBox: {
    backgroundColor: 'rgba(79, 209, 199, 0.3)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    width: '100%',
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 22,
  },
  quizIntro: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  detailsLabel: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  detailsText: {
    fontSize: 12,
    color: '#FFF',
  },
  startButton: {
    backgroundColor: '#FFF',
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
    color: '#FFF',
    fontSize: 14,
    opacity: 0.9,
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
    color: '#FFF',
    opacity: 0.8,
  },
});

