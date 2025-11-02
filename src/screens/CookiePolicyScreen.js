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

export default function CookiePolicyScreen({ navigation }) {
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
        <Text style={styles.headerTitle}>Cookie Policy</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>1. What Are Cookies?</Text>
          <Text style={styles.text}>
            Cookies are small text files that are placed on your device when you visit our app. They help us provide a better experience and understand how you use our services.
          </Text>

          <Text style={styles.sectionTitle}>2. How We Use Cookies</Text>
          <Text style={styles.text}>
            We use cookies to:
            {'\n\n'}
            • Remember your preferences and settings
            • Keep you logged in securely
            • Analyze app usage and performance
            • Provide personalized content and recommendations
            • Ensure app security and prevent fraud
          </Text>

          <Text style={styles.sectionTitle}>3. Types of Cookies We Use</Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Essential Cookies:</Text>
            Required for the app to function properly (authentication, security).
            {'\n\n'}
            <Text style={styles.bold}>Analytics Cookies:</Text>
            Help us understand how users interact with the app to improve performance.
            {'\n\n'}
            <Text style={styles.bold}>Preference Cookies:</Text>
            Remember your settings and preferences for a personalized experience.
          </Text>

          <Text style={styles.sectionTitle}>4. Managing Cookies</Text>
          <Text style={styles.text}>
            You can control cookies through your device settings. However, disabling certain cookies may limit the functionality of the app.
          </Text>

          <Text style={styles.sectionTitle}>5. Third-Party Cookies</Text>
          <Text style={styles.text}>
            We may use third-party services (like analytics) that also use cookies. These are subject to their respective privacy policies.
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
  bold: {
    fontWeight: 'bold',
  },
  lastUpdated: {
    fontSize: 13,
    color: '#718096',
    fontStyle: 'italic',
    marginTop: 24,
    textAlign: 'center',
  },
});

