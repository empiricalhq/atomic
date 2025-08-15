import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { storageService } from '../services/StorageService';
import { userService } from '../services/UserService';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
  features: string[];
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenido a Atomic',
    subtitle: 'Tu compañero inteligente para el control de gastos',
    icon: 'rocket',
    gradient: ['#667eea', '#764ba2'],
    features: ['Control total de tus finanzas', 'Análisis inteligente', 'Seguro y privado'],
  },
  {
    id: 'track',
    title: 'Registra sin esfuerzo',
    subtitle: 'Escanea recibos o añade gastos manualmente',
    icon: 'camera',
    gradient: ['#f093fb', '#f5576c'],
    features: ['Escaneo automático de recibos', 'Categorización inteligente', 'Entrada rápida'],
  },
  {
    id: 'analyze',
    title: 'Insights personalizados',
    subtitle: 'Descubre patrones en tus hábitos de gasto',
    icon: 'analytics',
    gradient: ['#4facfe', '#00f2fe'],
    features: ['Reportes detallados', 'Tendencias de gastos', 'Predicciones'],
  },
  {
    id: 'goals',
    title: 'Alcanza tus metas',
    subtitle: 'Establece presupuestos y cumple objetivos financieros',
    icon: 'trophy',
    gradient: ['#43e97b', '#38f9d7'],
    features: ['Presupuestos personalizados', 'Alertas inteligentes', 'Seguimiento de metas'],
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => setCurrentStep(currentStep + 1), 150);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    try {
      await userService.createAnonymousUser();
      await storageService.setOnboardingComplete();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      router.replace('/(tabs)');
    }
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[
          currentStepData.gradient[0] || '#000',
          currentStepData.gradient[1] || '#fff',
          ...currentStepData.gradient.slice(2),
        ]}
        style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.stepIndicator}>
              {currentStep + 1} / {ONBOARDING_STEPS.length}
            </Text>
          </View>

          {!isLastStep && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Saltar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name={currentStepData.icon} size={80} color="white" />
            </View>
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
          </View>

          {/* Features */}
          <Card style={styles.featuresCard} shadow={false}>
            {currentStepData.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="checkmark" size={16} color="#34C759" />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </Card>

          {/* Progress Dots */}
          <View style={styles.dotsContainer}>
            {ONBOARDING_STEPS.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dot,
                  index === currentStep && styles.activeDot,
                  index < currentStep && styles.completedDot,
                ]}
                onPress={() => setCurrentStep(index)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title={isLastStep ? 'Comenzar mi viaje financiero' : 'Continuar'}
            onPress={handleNext}
            variant="secondary"
            size="large"
            icon={isLastStep ? 'rocket' : 'arrow-forward'}
            iconPosition="right"
            style={styles.nextButton}
          />

          {currentStep > 0 && !isLastStep && (
            <TouchableOpacity
              onPress={() => setCurrentStep(currentStep - 1)}
              style={styles.backButton}>
              <Text style={styles.backText}>Anterior</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    height: 60,
  },
  headerLeft: {
    flex: 1,
  },
  stepIndicator: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  skipText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: width - 80,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuresCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 32,
    width: '100%',
    padding: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
    flex: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeDot: {
    backgroundColor: 'white',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    transform: [{ scale: 1.2 }],
  },
  completedDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
});
