import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigationBar from '../components/BottomNavigationBar';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.text}>
            We collect information that you provide directly to us, including:
            {'\n\n'}
            • Name, email address, and account credentials
            • Habits, goals, and progress data
            • Mood assessments and quiz results
            • Usage data and app interaction patterns
          </Text>

          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.text}>
            We use the information we collect to:
            {'\n\n'}
            • Provide personalized habit tracking and recommendations
            • Improve our services and user experience
            • Send you updates and notifications
            • Generate AI-powered insights based on your data
          </Text>

          <Text style={styles.sectionTitle}>3. Data Security</Text>
          <Text style={styles.text}>
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
          </Text>

          <Text style={styles.sectionTitle}>4. Your Rights</Text>
          <Text style={styles.text}>
            You have the right to:
            {'\n\n'}
            • Access your personal data
            • Request correction of inaccurate data
            • Request deletion of your data
            • Object to processing of your data
            • Request data portability
          </Text>

          <Text style={styles.sectionTitle}>5. Contact Us</Text>
          <Text style={styles.text}>
            If you have any questions about this Privacy Policy, please contact us at:
            {'\n\n'}
            Email: privacy@rdmapp.com
            {'\n'}
            Phone: +1 (555) 123-4567
          </Text>

          <Text style={styles.lastUpdated}>
            Last Updated: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>

      <BottomNavigationBar navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 24,
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4A5568',
    marginBottom: 16,
  },
  lastUpdated: {
    fontSize: 13,
    color: '#718096',
    fontStyle: 'italic',
    marginTop: 24,
    textAlign: 'center',
  },
});

