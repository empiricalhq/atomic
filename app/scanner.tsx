import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = 250;

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const scanLineAnimation = new Animated.Value(0);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    const animateLine = () => {
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

    if (hasPermission && !scanned) {
      animateLine();
    }
  }, [hasPermission, scanned]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);

    Alert.alert('QR Code Escaneado', `Dirección detectada:\n${data}`, [
      {
        text: 'Escanear Otra vez',
        style: 'default',
        onPress: () => setScanned(false),
      },
      {
        text: 'Usar Dirección',
        style: 'default',
        onPress: () => {
          router.back();
        },
      },
    ]);
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="camera" size={64} color="#8E8E93" />
          <Text style={styles.permissionText}>Solicitando permisos de cámara...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="videocam-off" size={64} color="#FF3B30" />
          <Text style={styles.permissionText}>Sin acceso a la cámara</Text>
          <Text style={styles.permissionSubtext}>
            Necesitas habilitar los permisos de cámara en configuración
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const scanLineTop = scanLineAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_AREA_SIZE - 4],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Ionicons name="qr-code" size={24} color="white" />
        </View>

        <TouchableOpacity
          style={[styles.headerButton, flashEnabled && styles.flashActive]}
          onPress={toggleFlash}>
          <Ionicons name={flashEnabled ? 'flash' : 'flash-off'} size={28} color="white" />
        </TouchableOpacity>
      </View>

      <CameraView
        style={styles.camera}
        facing="back"
        flash={flashEnabled ? 'on' : 'off'}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            'qr',
            'aztec',
            'ean13',
            'ean8',
            'upc_e',
            'datamatrix',
            'code128',
            'code39',
            'code93',
            'codabar',
            'itf14',
            'pdf417',
            'upc_a',
          ],
        }}
      />

      <View style={styles.overlay}>
        <View style={styles.scanAreaContainer}>
          <View style={[styles.overlaySection, styles.topOverlay]} />
          <View style={styles.middleRow}>
            <View style={[styles.overlaySection, styles.sideOverlay]} />
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              <Animated.View style={[styles.scanLine, { top: scanLineTop }]} />
            </View>
            <View style={[styles.overlaySection, styles.sideOverlay]} />
          </View>
          <View style={[styles.overlaySection, styles.bottomOverlay]} />
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <Text style={styles.instructionText}>Scan an Address</Text>
        <Text style={styles.subText}>Please scan an Ethereum wallet{'\n'}address to continue</Text>

        <TouchableOpacity
          style={styles.manualButton}
          onPress={() => {
            Alert.alert('Entrada Manual', 'Ingresa la dirección manualmente', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Ingresar', onPress: () => router.back() },
            ]);
          }}>
          <Text style={styles.manualButtonText}>Ingresar Manualmente</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
  permissionSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
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
  overlaySection: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  topOverlay: {
    width: width,
    height: (height - SCAN_AREA_SIZE) / 2,
  },
  middleRow: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  sideOverlay: {
    width: (width - SCAN_AREA_SIZE) / 2,
    height: SCAN_AREA_SIZE,
  },
  bottomOverlay: {
    width: width,
    height: (height - SCAN_AREA_SIZE) / 2,
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
    borderColor: 'white',
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
    height: 4,
    backgroundColor: 'white',
    opacity: 0.8,
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: 40,
    paddingVertical: 40,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  subText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  manualButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  manualButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
