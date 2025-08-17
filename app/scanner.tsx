import { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Dimensions, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = Math.min(width * 0.8, 300);

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
          duration: 2500,
          useNativeDriver: false,
        }),
        Animated.timing(scanLineAnimation, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const processImage = async (_imageUri: string) => {
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
        mediaTypes: ['images', 'videos'],
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

  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6b7280" />
          <Typography variant="body" weight="medium" className="mt-3 text-gray-400">
            Preparando cámara...
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-gray-900/50">
            <Ionicons name="videocam-off" size={28} color="#6b7280" />
          </View>
          <Typography variant="h3" weight="semibold" className="mb-2 text-center text-white">
            Acceso a cámara requerido
          </Typography>
          <Typography variant="body" className="mb-8 text-center text-gray-400">
            Necesitamos acceso a tu cámara para escanear recibos
          </Typography>
          <Button variant="primary" size="lg" onPress={requestPermissions} className="mb-4">
            Permitir acceso
          </Button>
          <TouchableOpacity onPress={() => router.back()}>
            <Typography variant="body" className="text-gray-500">
              Volver
            </Typography>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const scanLineTop = scanLineAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_AREA_SIZE - 3],
  });

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-black">
      <View className="flex-row items-center justify-between px-5 py-3">
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
          onPress={() => router.back()}>
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
        <Typography variant="body" weight="medium" className="text-white">
          Escanear Recibo
        </Typography>
        <TouchableOpacity
          className={`h-10 w-10 items-center justify-center rounded-full ${
            flashEnabled ? 'bg-white/30' : 'bg-black/40'
          }`}
          onPress={() => setFlashEnabled(!flashEnabled)}>
          <Ionicons name={flashEnabled ? 'flash' : 'flash-off'} size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View className="relative flex-1">
        <CameraView
          className="absolute inset-0"
          facing="back"
          flash={flashEnabled ? 'on' : 'off'}
        />

        <View
          className="absolute inset-0 items-center justify-center"
          style={{ paddingTop: 60, paddingBottom: 200 }}>
          <View
            className="bg-black/50"
            style={{
              width: width,
              height: (height - SCAN_AREA_SIZE - 260) / 2,
            }}
          />

          <View className="flex-row" style={{ height: SCAN_AREA_SIZE }}>
            <View
              className="bg-black/50"
              style={{
                width: (width - SCAN_AREA_SIZE) / 2,
                height: SCAN_AREA_SIZE,
              }}
            />

            <View
              className="relative"
              style={{
                width: SCAN_AREA_SIZE,
                height: SCAN_AREA_SIZE,
              }}>
              <View className="absolute left-0 top-0 h-6 w-6 rounded-tl-lg border-l-4 border-t-4 border-white" />
              <View className="absolute right-0 top-0 h-6 w-6 rounded-tr-lg border-r-4 border-t-4 border-white" />
              <View className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-lg border-b-4 border-l-4 border-white" />
              <View className="absolute bottom-0 right-0 h-6 w-6 rounded-br-lg border-b-4 border-r-4 border-white" />

              {!scanState.processing && (
                <Animated.View
                  key="scan-line"
                  className="absolute left-4 right-4 h-0.5 rounded-full bg-white opacity-90 shadow-lg"
                  style={{ top: scanLineTop }}
                />
              )}

              {scanState.processing && (
                <View className="absolute inset-0 items-center justify-center rounded-3xl bg-black/40">
                  <ActivityIndicator size="large" color="white" />
                  <Typography variant="body" weight="medium" className="mt-3 text-white">
                    Procesando...
                  </Typography>
                </View>
              )}
            </View>

            <View
              className="bg-black/50"
              style={{
                width: (width - SCAN_AREA_SIZE) / 2,
                height: SCAN_AREA_SIZE,
              }}
            />
          </View>

          <View
            className="bg-black/50"
            style={{
              width: width,
              height: (height - SCAN_AREA_SIZE - 260) / 2,
            }}
          />
        </View>
      </View>

      <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent px-6 pb-8 pt-12">
        <Typography
          variant="body"
          weight="semibold"
          className="mb-2 text-center text-xl text-white">
          {scanState.processing ? 'Analizando recibo...' : 'Centra el recibo en el marco'}
        </Typography>
        <Typography variant="body" className="mb-8 text-center text-white/80">
          Extraeremos automáticamente todos los detalles
        </Typography>

        <View className="mb-6 flex-row items-center justify-center">
          <TouchableOpacity
            className="mr-1 h-16 w-16 items-center justify-center rounded-full border-2 border-white/50 bg-white/10 backdrop-blur-sm"
            onPress={handlePickFromGallery}
            disabled={scanState.processing}>
            <Ionicons name="images" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            className={`mx-1 h-20 w-20 items-center justify-center rounded-full shadow-lg ${
              scanState.scanning || scanState.processing ? 'bg-gray-700' : 'bg-white'
            }`}
            onPress={handleTakePicture}
            disabled={scanState.processing || scanState.scanning}>
            {scanState.scanning ? (
              <ActivityIndicator size="large" color="#374151" />
            ) : (
              <Ionicons name="camera" size={44} color="#1f2937" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="ml-1 h-16 w-16 items-center justify-center rounded-full border-2 border-white/50 bg-white/10 backdrop-blur-sm"
            onPress={() => router.push('/(tabs)/add-expense')}
            disabled={scanState.processing}>
            <Ionicons name="create" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {scanState.error && (
          <View className="mt-4 rounded-xl border border-red-500/30 bg-red-500/20 px-4 py-3">
            <Typography variant="body" className="text-center text-red-300">
              {scanState.error}
            </Typography>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
