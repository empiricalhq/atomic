import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ConfigScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const settingsGroups = [
    {
      title: 'Cuenta',
      items: [
        {
          icon: 'person-circle',
          title: 'Perfil',
          subtitle: 'Información personal',
          action: 'chevron',
        },
        {
          icon: 'shield-checkmark',
          title: 'Seguridad',
          subtitle: 'Contraseña y autenticación',
          action: 'chevron',
        },
        {
          icon: 'card',
          title: 'Métodos de Pago',
          subtitle: 'Tarjetas y cuentas bancarias',
          action: 'chevron',
        },
      ],
    },
    {
      title: 'Preferencias',
      items: [
        {
          icon: 'notifications',
          title: 'Notificaciones',
          subtitle: 'Alertas y recordatorios',
          action: 'switch',
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          icon: 'finger-print',
          title: 'Autenticación Biométrica',
          subtitle: 'Face ID / Touch ID',
          action: 'switch',
          value: biometricEnabled,
          onToggle: setBiometricEnabled,
        },
        {
          icon: 'moon',
          title: 'Modo Oscuro',
          subtitle: 'Apariencia de la aplicación',
          action: 'switch',
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled,
        },
      ],
    },
    {
      title: 'Datos',
      items: [
        {
          icon: 'download',
          title: 'Exportar Datos',
          subtitle: 'Descargar tus transacciones',
          action: 'chevron',
        },
        {
          icon: 'sync',
          title: 'Sincronización',
          subtitle: 'Backup automático',
          action: 'chevron',
        },
      ],
    },
    {
      title: 'Soporte',
      items: [
        {
          icon: 'help-circle',
          title: 'Ayuda',
          subtitle: 'Preguntas frecuentes',
          action: 'chevron',
        },
        {
          icon: 'mail',
          title: 'Contacto',
          subtitle: 'Enviar feedback',
          action: 'chevron',
        },
        {
          icon: 'document-text',
          title: 'Términos y Condiciones',
          subtitle: 'Políticas de la aplicación',
          action: 'chevron',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuración</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="white" />
            </View>
          </View>
          <Text style={styles.profileName}>Usuario</Text>
          <Text style={styles.profileEmail}>usuario@email.com</Text>
        </View>

        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupContainer}>
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex === group.items.length - 1 && styles.lastItem,
                  ]}>
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIconContainer}>
                      <Ionicons name={item.icon as any} size={20} color="#007AFF" />
                    </View>
                    <View style={styles.settingTexts}>
                      <Text style={styles.settingTitle}>{item.title}</Text>
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <View style={styles.settingRight}>
                    {item.action === 'switch' && 'value' in item && (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                        thumbColor="white"
                      />
                    )}
                    {item.action === 'chevron' && (
                      <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.signOutButton}>
          <Ionicons name="log-out" size={20} color="#FF3B30" />
          <Text style={styles.signOutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Versión 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#8E8E93',
  },
  settingsGroup: {
    marginBottom: 32,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  groupContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTexts: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  settingRight: {
    marginLeft: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 32,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#8E8E93',
    paddingBottom: 32,
  },
});
