import { Ionicons } from '@expo/vector-icons';

export interface SettingsItem {
  id?: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  action: 'chevron' | 'switch';
}

interface SettingsGroup {
  title: string;
  items: SettingsItem[];
}

export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    title: 'Cuenta',
    items: [
      { icon: 'person-circle', title: 'Perfil', action: 'chevron' },
      { icon: 'shield-checkmark', title: 'Seguridad', action: 'chevron' },
      { icon: 'card', title: 'Métodos de Pago', action: 'chevron' },
    ],
  },
  {
    title: 'Preferencias',
    items: [
      { id: 'notifications', icon: 'notifications', title: 'Notificaciones', action: 'switch' },
      {
        id: 'biometric',
        icon: 'finger-print',
        title: 'Autenticación Biométrica',
        action: 'switch',
      },
      { id: 'darkMode', icon: 'moon', title: 'Modo Oscuro', action: 'switch' },
    ],
  },
  {
    title: 'Datos',
    items: [
      { icon: 'download', title: 'Exportar Datos', action: 'chevron' },
      { icon: 'sync', title: 'Sincronización', action: 'chevron' },
    ],
  },
  {
    title: 'Soporte',
    items: [
      { icon: 'help-circle', title: 'Ayuda', action: 'chevron' },
      { icon: 'mail', title: 'Contacto', action: 'chevron' },
      { icon: 'document-text', title: 'Términos y Condiciones', action: 'chevron' },
    ],
  },
];
