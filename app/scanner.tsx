import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = Math.min(width * 0.7, 250);

interface ScanState {
  scanning: boolean;
  processing: boolean;
  error: string | null;
}

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanState, setScanState] = useState<ScanState>({
    scanning: false,
    processing: false,
    error: null,
  });

  const scanLineAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    if (hasPermission && !scanState.processing) {
      startScanAnimation();
    }
  }, [hasPermission, scanState.processing]);

  const requestPermissions = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
    }
  };

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(scanLineAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const processImage = async (imageUri: string) => {
    setScanState({
      scanning: false,
      processing: true,
      error: null,
    });

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockResponse = {
        amount: 45.67,
        merchant: 'Starbucks',
        category: 'Food & Drink',
        date: new Date().toISOString(),
        items: [
          { name: 'Latte', price: 4.25 },
          { name: 'Sandwich', price: 6.75 },
        ],
      };

      router.push({
        pathname: '/(tabs)/add-expense',
        params: {
          amount: mockResponse.amount.toString(),
          description: mockResponse.merchant,
          category: mockResponse.category,
          receiptData: JSON.stringify(mockResponse),
        },
      });
    } catch (error) {
      console.error('Error processing receipt:', error);
      setScanState({
        scanning: false,
        processing: false,
        error: 'Error procesando el recibo. Inténtalo nuevamente.',
      });
    }
  };

  const handleTakePicture = async () => {
    setScanState((prev) => ({ ...prev, scanning: true }));
    setTimeout(() => {
      const mockImageUri = 'mock://receipt.jpg';
      processImage(mockImageUri);
    }, 500);
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const scanLineTop = scanLineAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_AREA_SIZE - 4],
  });

  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <StatusBar barStyle="light-content" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#64748b" />
          <Text className="mt-4 text-lg font-medium text-slate-300">Preparando cámara...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <StatusBar barStyle="light-content" />
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-slate-800">
            <Ionicons name="videocam-off" size={32} color="#64748b" />
          </View>
          <Text className="mb-3 text-center text-xl font-bold text-white">
            Acceso a cámara requerido
          </Text>
          <Text className="mb-8 text-center leading-relaxed text-slate-300">
            Para escanear recibos necesitamos acceso a tu cámara
          </Text>
          <TouchableOpacity
            className="mb-4 rounded-2xl bg-slate-800 px-8 py-4"
            onPress={requestPermissions}>
            <Text className="text-lg font-semibold text-white">Permitir acceso</Text>
          </TouchableOpacity>
          <TouchableOpacity className="px-6 py-3" onPress={() => router.back()}>
            <Text className="font-medium text-slate-400">Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      <CameraView className="absolute inset-0" facing="back" flash={flashEnabled ? 'on' : 'off'} />

      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between bg-black/20 px-6 py-4">
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full bg-black/60"
            onPress={() => router.back()}>
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-white">Escanear recibo</Text>
          <TouchableOpacity
            className={`h-10 w-10 items-center justify-center rounded-full ${
              flashEnabled ? 'bg-white/20' : 'bg-black/60'
            }`}
            onPress={() => setFlashEnabled(!flashEnabled)}>
            <Ionicons name={flashEnabled ? 'flash' : 'flash-off'} size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center">
          <View
            className="relative rounded-2xl border-2 border-white/30"
            style={{
              width: SCAN_AREA_SIZE,
              height: SCAN_AREA_SIZE,
            }}>
            <View className="absolute -left-1 -top-1 h-6 w-6 rounded-tl-xl border-l-4 border-t-4 border-white" />
            <View className="absolute -right-1 -top-1 h-6 w-6 rounded-tr-xl border-r-4 border-t-4 border-white" />
            <View className="absolute -bottom-1 -left-1 h-6 w-6 rounded-bl-xl border-b-4 border-l-4 border-white" />
            <View className="absolute -bottom-1 -right-1 h-6 w-6 rounded-br-xl border-b-4 border-r-4 border-white" />

            {!scanState.processing && (
              <Animated.View
                className="absolute left-0 right-0 h-0.5 bg-white opacity-80"
                style={{ top: scanLineTop }}
              />
            )}

            {scanState.processing && (
              <View className="flex-1 items-center justify-center rounded-2xl bg-black/30">
                <ActivityIndicator size="large" color="white" />
                <Text className="mt-3 text-lg font-medium text-white">Procesando...</Text>
              </View>
            )}
          </View>
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={{ paddingHorizontal: 32, paddingBottom: 32 }}>
          <Text className="mb-2 text-center text-xl font-semibold text-white">
            {scanState.processing ? 'Analizando recibo...' : 'Centra el recibo en el marco'}
          </Text>
          <Text className="mb-8 text-center leading-relaxed text-slate-300">
            Extraeremos automáticamente todos los detalles
          </Text>

          <View className="flex-row items-center justify-center space-x-8">
            <TouchableOpacity
              className="h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/20"
              onPress={handlePickFromGallery}
              disabled={scanState.processing}>
              <Ionicons name="images" size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              className={`h-16 w-16 items-center justify-center rounded-full ${
                scanState.scanning || scanState.processing ? 'bg-slate-600' : 'bg-white'
              }`}
              onPress={handleTakePicture}
              disabled={scanState.processing || scanState.scanning}>
              {scanState.scanning ? (
                <ActivityIndicator color="#334155" />
              ) : (
                <Ionicons name="camera" size={24} color="#1e293b" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/20"
              onPress={() => router.push('/(tabs)/add-expense')}
              disabled={scanState.processing}>
              <Ionicons name="create" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {scanState.error && (
            <View className="mt-4 rounded-xl border border-red-500/30 bg-red-500/20 p-4">
              <Text className="text-center text-red-300">{scanState.error}</Text>
            </View>
          )}
        </LinearGradient>
      </SafeAreaView>
    </View>
  );
}
