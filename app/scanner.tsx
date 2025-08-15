import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

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
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    if (hasPermission && !scanState.processing) {
      startScanAnimation();
      startPulseAnimation();
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

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
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
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would call your backend API to process the receipt
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

      // Navigate to add expense screen with pre-filled data
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
    setScanState(prev => ({ ...prev, scanning: true }));
    
    // Simulate picture taking
    setTimeout(() => {
      const mockImageUri = 'mock://receipt.jpg';
      processImage(mockImageUri);
    }, 500);
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.permissionText}>Preparando cámara...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1C1C1E', '#000']} style={styles.gradient}>
          <View style={styles.centerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="videocam-off" size={64} color="#8E8E93" />
            </View>
            <Text style={styles.permissionText}>Acceso a cámara requerido</Text>
            <Text style={styles.permissionSubtext}>
              Para escanear recibos necesitamos acceso a tu cámara
            </Text>
            <TouchableOpacity 
              style={styles.permissionButton} 
              onPress={requestPermissions}
            >
              <Text style={styles.permissionButtonText}>Permitir acceso</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const scanLineTop = scanLineAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_AREA_SIZE - 4],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Escanear Recibo</Text>
        </View>

        <TouchableOpacity
          style={[styles.headerButton, flashEnabled && styles.flashActive]}
          onPress={toggleFlash}
        >
          <Ionicons name={flashEnabled ? 'flash' : 'flash-off'} size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Camera */}
      <CameraView
        style={styles.camera}
        facing="back"
        flash={flashEnabled ? 'on' : 'off'}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.scanAreaContainer}>
          {/* Top overlay */}
          <View style={styles.topOverlay} />
          
          {/* Middle row */}
          <View style={styles.middleRow}>
            <View style={styles.sideOverlay} />
            
            {/* Scan area */}
            <Animated.View 
              style={[
                styles.scanArea,
                { transform: [{ scale: pulseAnimation }] }
              ]}
            >
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {!scanState.processing && (
                <Animated.View style={[styles.scanLine, { top: scanLineTop }]} />
              )}
              
              {scanState.processing && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.processingText}>Procesando...</Text>
                </View>
              )}
            </Animated.View>
            
            <View style={styles.sideOverlay} />
          </View>
          
          {/* Bottom overlay */}
          <View style={styles.bottomOverlay} />
        </View>
      </View>

      {/* Bottom controls */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.bottomContainer}
      >
        <Text style={styles.instructionText}>
          {scanState.processing 
            ? 'Analizando tu recibo...' 
            : 'Posiciona el recibo dentro del marco'
          }
        </Text>
        <Text style={styles.subText}>
          Nos encargaremos de extraer todos los detalles automáticamente
        </Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handlePickFromGallery}
            disabled={scanState.processing}
          >
            <Ionicons name="images" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.captureButton,
              (scanState.scanning || scanState.processing) && styles.captureButtonDisabled
            ]}
            onPress={handleTakePicture}
            disabled={scanState.processing || scanState.scanning}
          >
            {scanState.scanning ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="camera" size={32} color="white" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => router.push('/(tabs)/add-expense')}
            disabled={scanState.processing}
          >
            <Ionicons name="create" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {scanState.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{scanState.error}</Text>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  gradient: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  permissionText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  flashActive: {
    backgroundColor: 'rgba(255, 193, 7, 0.8)',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scanAreaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topOverlay: {
    width: width,
    height: (height - SCAN_AREA_SIZE) / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  middleRow: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  sideOverlay: {
    width: (width - SCAN_AREA_SIZE) / 2,
    height: SCAN_AREA_SIZE,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  bottomOverlay: {
    width: width,
    height: (height - SCAN_AREA_SIZE) / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#007AFF',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#007AFF',
    opacity: 0.8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  processingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 48,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  galleryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonDisabled: {
    backgroundColor: 'rgba(0, 122, 255, 0.5)',
  },
  manualButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  errorContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
});