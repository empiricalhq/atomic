import { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { storageService } from '../services/StorageService';
import { userService } from '../services/UserService';

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Controla tus gastos',
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
    subtitle: 'Entiende mejor en qué gastas tu dinero con reportes claros',
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
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pb-2 pt-4">
        <Text className="text-sm font-medium text-slate-500">
          {currentStep + 1} de {ONBOARDING_STEPS.length}
        </Text>
        {!isLastStep && (
          <TouchableOpacity
            onPress={handleGetStarted}
            className="rounded-full bg-slate-200 px-4 py-2 active:bg-slate-300">
            <Text className="text-sm font-semibold text-slate-700">Saltar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="flex-1 items-center justify-center px-8">
        {/* Icon */}
        <View className="mb-12 h-32 w-32 items-center justify-center rounded-full bg-slate-200">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-slate-300">
            <Ionicons name={currentStepData.icon} size={36} color="#475569" />
          </View>
        </View>

        {/* Text Content */}
        <View className="mb-16 items-center">
          <Text className="mb-4 text-center text-3xl font-bold leading-tight text-slate-900">
            {currentStepData.title}
          </Text>
          <Text className="max-w-sm text-center text-lg leading-relaxed text-slate-600">
            {currentStepData.subtitle}
          </Text>
        </View>

        {/* Progress Dots */}
        <View className="mb-8 flex-row items-center space-x-3">
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-slate-800'
                  : index < currentStep
                    ? 'w-2 bg-slate-400'
                    : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </View>
      </Animated.View>

      {/* Footer */}
      <View className="px-8 pb-12">
        <TouchableOpacity
          onPress={handleNext}
          className="flex-row items-center justify-center rounded-2xl bg-slate-900 px-8 py-4 active:bg-slate-800"
          style={{
            shadowColor: '#1e293b',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
          }}>
          <Text className="mr-2 text-lg font-semibold text-white">
            {isLastStep ? 'Comenzar' : 'Continuar'}
          </Text>
          <Ionicons name={isLastStep ? 'checkmark' : 'arrow-forward'} size={18} color="white" />
        </TouchableOpacity>

        {currentStep > 0 && (
          <TouchableOpacity
            onPress={() => setCurrentStep(currentStep - 1)}
            className="mt-4 items-center py-3 active:opacity-70">
            <Text className="font-medium text-slate-500">Anterior</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
