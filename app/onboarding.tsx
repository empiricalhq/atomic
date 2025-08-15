import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen() {
  const [checkedItems, setCheckedItems] = useState({
    expenses: false,
    money: false,
    goals: false,
  });

  const handleCheck = (item: keyof typeof checkedItems) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const allChecked = Object.values(checkedItems).every(Boolean);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* logo and title */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="analytics" size={40} color="#007AFF" />
          </View>
          <Text style={styles.logoText}>atomic</Text>
        </View>

        {/* list of features */}
        <View style={styles.featuresContainer}>
          <TouchableOpacity style={styles.featureItem} onPress={() => handleCheck('expenses')}>
            <View style={styles.checkbox}>
              {checkedItems.expenses && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.featureText}>Registra tus gastos fácilmente</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureItem} onPress={() => handleCheck('money')}>
            <View style={styles.checkbox}>
              {checkedItems.money && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.featureText}>Analiza tu dinero</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureItem} onPress={() => handleCheck('goals')}>
            <View style={styles.checkbox}>
              {checkedItems.goals && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.featureText}>Cumple tus metas</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.startButton, allChecked && styles.startButtonActive]}
          disabled={!allChecked}
          onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.startButtonText}>Comenzar</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        <Text style={styles.subtitle}>Ya tienes una cuenta? Inicia sesión.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    paddingVertical: 60,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#1C1C1E',
    letterSpacing: -1,
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 18,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8E8E93',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 16,
  },
  startButtonActive: {
    backgroundColor: '#007AFF',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#8E8E93',
  },
});
