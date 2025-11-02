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

export default function TermsConditionsScreen({ navigation }) {
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
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.
          </Text>

          <Text style={styles.sectionTitle}>2. Use License</Text>
          <Text style={styles.text}>
            Permission is granted to temporarily use the app for personal, non-commercial purposes. This license shall automatically terminate if you violate any of these restrictions.
          </Text>

          <Text style={styles.sectionTitle}>3. User Account</Text>
          <Text style={styles.text}>
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
          </Text>

          <Text style={styles.sectionTitle}>4. Prohibited Uses</Text>
          <Text style={styles.text}>
            You may not:
            {'\n\n'}
            • Use the app in any unlawful manner
            • Attempt to gain unauthorized access to any portion of the app
            • Interfere with or disrupt the app or servers
            • Use any automated system to access the app
          </Text>

          <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
          <Text style={styles.text}>
            The app and its original content, features, and functionality are owned by RDM and are protected by international copyright, trademark, and other intellectual property laws.
          </Text>

          <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
          <Text style={styles.text}>
            In no event shall RDM be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the app.
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

