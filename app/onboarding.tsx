import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { storageService } from '../services/StorageService';
import { userService } from '../services/UserService';

const { width } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenido a atomic',
    subtitle: 'Tu compañero inteligente para el control de gastos',
    icon: 'analytics',
    color: '#007AFF',
  },
  {
    id: 'track',
    title: 'Registra fácilmente',
    subtitle: 'Toma fotos de tus recibos y nosotros nos encargamos del resto',
    icon: 'camera',
    color: '#FF9500',
  },
  {
    id: 'analyze',
    title: 'Analiza tu dinero',
    subtitle: 'Obtén insights personalizados sobre tus hábitos de gasto',
    icon: 'stats-chart',
    color: '#34C759',
  },
  {
    id: 'goals',
    title: 'Cumple tus metas',
    subtitle: 'Establece presupuestos y alcanza tus objetivos financieros',
    icon: 'trophy',
    color: '#5856D6',
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    try {
      // Create anonymous user
      await userService.createAnonymousUser();
      await storageService.setOnboardingComplete();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still proceed to main app
      router.replace('/(tabs)');
    }
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Saltar</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Logo and Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[currentStepData.color, `${currentStepData.color}80`]}
              style={styles.iconGradient}
            >
              <Ionicons 
                name={currentStepData.icon as any} 
                size={60} 
                color="white" 
              />
            </LinearGradient>
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
          </View>

          {/* Progress Dots */}
          <View style={styles.dotsContainer}>
            {ONBOARDING_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === currentStep 
                      ? currentStepData.color 
                      : '#E5E5EA',
                    width: index === currentStep ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: currentStepData.color }
            ]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {isLastStep ? 'Comenzar' : 'Continuar'}
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color="white" 
              style={styles.buttonIcon}
            />
          </TouchableOpacity>

          {!isLastStep && (
            <View style={styles.navigationHint}>
              <Text style={styles.hintText}>
                {currentStep + 1} de {ONBOARDING_STEPS.length}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
    height: 60,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 48,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: width - 80,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s ease',
  } as ViewStyle & { transition?: string },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  navigationHint: {
    marginTop: 16,
  },
  hintText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});