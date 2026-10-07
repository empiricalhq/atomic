import { Ionicons } from '@expo/vector-icons';

export interface SettingsItem {
  id: 'notifications' | 'biometric' | 'darkMode';
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}

interface SettingsGroup {
  title: string;
  items: SettingsItem[];
}

export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    title: 'Preferencias',
    items: [
      { id: 'notifications', icon: 'notifications', title: 'Notificaciones' },
      { id: 'biometric', icon: 'finger-print', title: 'Autenticación Biométrica' },
      { id: 'darkMode', icon: 'moon', title: 'Modo Oscuro' },
    ],
  },
];
