import { useState } from 'react';
import { View, Animated } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { storageService } from '@/services/storageService';
import { userService } from '@/api/userService';
import Screen from '@/components/layout/Screen';
import Button from '@/components/common/Button';
import Typography from '@/components/common/Typography';

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Controla tus finanzas',
    subtitle: 'Registra y analiza tus transacciones de forma simple y elegante',
    icon: 'wallet-outline',
  },
  {
    id: 'track',
    title: 'Escanea recibos',
    subtitle: 'Captura gastos automáticamente usando tu cámara',
    icon: 'camera-outline',
  },
  {
    id: 'analyze',
    title: 'Analiza patrones',
    subtitle: 'Entiende mejor en qué gastas con reportes claros',
    icon: 'analytics-outline',
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
    <Screen background="white" safeArea padding="none">
      <View className="flex-row items-center justify-between px-6 py-4">
        <View className="flex-row">
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              className={`mr-2 h-1 rounded-full transition-all ${
                index === currentStep
                  ? 'w-6 bg-gray-800'
                  : index < currentStep
                    ? 'w-1 bg-gray-400'
                    : 'w-1 bg-gray-200'
              }`}
            />
          ))}
        </View>
        {!isLastStep && (
          <Button variant="ghost" size="sm" onPress={handleGetStarted} className="px-4 py-2">
            Saltar
          </Button>
        )}
      </View>

      <Animated.View
        style={{ opacity: fadeAnim }}
        className="flex-1 items-center justify-center px-8">
        <View className="mb-16">
          <View className="h-32 w-32 items-center justify-center rounded-full bg-gray-100">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-gray-800">
              <Ionicons name={currentStepData.icon} size={32} color="white" />
            </View>
          </View>
        </View>
        <View className="mb-16 items-center">
          <Typography variant="h1" weight="bold" className="mb-4 text-center leading-tight">
            {currentStepData.title}
          </Typography>
          <Typography
            variant="body"
            color="secondary"
            className="max-w-sm text-center text-lg leading-relaxed">
            {currentStepData.subtitle}
          </Typography>
        </View>
      </Animated.View>

      <View className="px-8 pb-12">
        <Button
          variant="primary"
          size="lg"
          onPress={handleNext}
          className="mb-4 rounded-2xl shadow-lg"
          icon={
            <Ionicons name={isLastStep ? 'checkmark' : 'arrow-forward'} size={16} color="white" />
          }>
          {isLastStep ? 'Comenzar' : 'Continuar'}
        </Button>
        {currentStep > 0 && (
          <Button
            variant="ghost"
            size="md"
            onPress={() => setCurrentStep(currentStep - 1)}
            className="items-center py-3">
            Anterior
          </Button>
        )}
      </View>
    </Screen>
  );
}
