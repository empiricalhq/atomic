import { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Switch } from 'react-native';
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
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 py-4">
        <Text className="text-2xl font-bold text-slate-900">Configuración</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View className="mb-8 items-center bg-white py-8">
          <View className="mb-4">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-slate-700">
              <Ionicons name="person" size={36} color="white" />
            </View>
          </View>
          <Text className="mb-1 text-2xl font-semibold text-slate-900">Usuario</Text>
          <Text className="text-base text-slate-500">usuario@email.com</Text>
        </View>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} className="mb-8">
            <Text className="mb-2 px-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {group.title}
            </Text>
            <View className="mx-5 overflow-hidden rounded-2xl bg-white">
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  className={`flex-row items-center justify-between px-4 py-4 active:bg-slate-50 ${
                    itemIndex !== group.items.length - 1 ? 'border-b border-slate-100' : ''
                  }`}>
                  <View className="flex-1 flex-row items-center">
                    <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                      <Ionicons name={item.icon as any} size={18} color="#475569" />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-0.5 text-base font-semibold text-slate-900">
                        {item.title}
                      </Text>
                      <Text className="text-sm text-slate-500">{item.subtitle}</Text>
                    </View>
                  </View>
                  <View className="ml-3">
                    {item.action === 'switch' && 'value' in item && (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: '#e2e8f0', true: '#475569' }}
                        thumbColor="white"
                        ios_backgroundColor="#e2e8f0"
                      />
                    )}
                    {item.action === 'chevron' && (
                      <Ionicons name="chevron-forward" size={16} color="#64748b" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out Button */}
        <TouchableOpacity className="mx-5 mb-8 flex-row items-center justify-center rounded-2xl bg-white py-4 active:bg-slate-50">
          <Ionicons name="log-out" size={20} color="#dc2626" />
          <Text className="ml-2 text-base font-semibold text-red-600">Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text className="pb-8 text-center text-sm text-slate-400">Versión 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
