import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useUser } from '@/hooks/useUser';
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
  const { createUser } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [startError, setStartError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  // Set synchronously, before the first await, so a second tap (Comenzar or
  // Saltar, both call this) fired before the disabled button re-renders
  // still bails out instead of calling createUser again. The provider's own
  // single-flight guard also covers this, but bailing here avoids a second
  // fade transition and a wasted round trip through it.
  const isStartingRef = useRef(false);

  const contentOpacity = useSharedValue(1);
  const backButtonOpacity = useSharedValue(0);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const backButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backButtonOpacity.value,
  }));

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 300 });
    backButtonOpacity.value = withTiming(currentStep > 0 ? 1 : 0, { duration: 300 });
  }, [currentStep, contentOpacity, backButtonOpacity]);

  const changeStep = (nextStep: number) => {
    const onFadeOutComplete = () => {
      'worklet';
      scheduleOnRN(setCurrentStep, nextStep);
    };
    contentOpacity.value = withTiming(0, { duration: 250 }, onFadeOutComplete);
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      changeStep(currentStep + 1);
    } else {
      handleGetStarted();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      changeStep(currentStep - 1);
    }
  };

  const handleGetStarted = async () => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setIsStarting(true);
    try {
      setStartError(null);
      await createUser();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // A failed save must not navigate on as if the account was created.
      setStartError('No se pudo iniciar. Intenta de nuevo.');
    } finally {
      isStartingRef.current = false;
      setIsStarting(false);
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
              className={`mr-2 h-1 rounded-full ${
                index === currentStep ? 'w-6 bg-gray-800' : 'w-1 bg-gray-200'
              }`}
            />
          ))}
        </View>
        {!isLastStep && (
          <Button
            variant="ghost"
            size="sm"
            onPress={handleGetStarted}
            disabled={isStarting}
            className="px-4 py-2">
            Saltar
          </Button>
        )}
      </View>

      <Reanimated.View
        style={contentAnimatedStyle}
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
      </Reanimated.View>

      <View className="px-8 pb-12">
        {startError && (
          <Typography variant="body" color="error" className="mb-3 text-center">
            {startError}
          </Typography>
        )}
        <Button
          variant="primary"
          size="lg"
          onPress={handleNext}
          disabled={isStarting}
          className="mb-4 rounded-2xl shadow-lg"
          icon={
            <Ionicons name={isLastStep ? 'checkmark' : 'arrow-forward'} size={16} color="white" />
          }>
          {isLastStep ? 'Comenzar' : 'Continuar'}
        </Button>

        <Reanimated.View style={backButtonAnimatedStyle}>
          <Button
            variant="ghost"
            size="md"
            onPress={handlePrevious}
            disabled={currentStep === 0}
            className="items-center py-3">
            Anterior
          </Button>
        </Reanimated.View>
      </View>
    </Screen>
  );
}
