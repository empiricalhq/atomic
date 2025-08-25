import { useState } from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/hooks/useUser';
import { SETTINGS_GROUPS } from '@/constants/settings';
import Screen from '@/components/layout/Screen';
import Header from '@/components/layout/Header';
import { UserProfileHeader } from '@/components/settings/UserProfileHeader';
import { SettingsGroup } from '@/components/settings/SettingsGroup';
import Typography from '@/components/common/Typography';

export default function ConfigScreen() {
  const { user } = useUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // these are fake values
  const dynamicSettings = {
    notifications: { value: notificationsEnabled, onToggle: setNotificationsEnabled },
    biometric: { value: biometricEnabled, onToggle: setBiometricEnabled },
    darkMode: { value: darkModeEnabled, onToggle: setDarkModeEnabled },
  };

  return (
    <Screen background="gray" padding="none">
      <Header title="Configuración" variant="elevated" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <UserProfileHeader user={user} />

        {SETTINGS_GROUPS.map((group, groupIndex) => (
          <SettingsGroup
            key={groupIndex}
            title={group.title}
            items={group.items}
            dynamicSettings={dynamicSettings}
          />
        ))}

        <TouchableOpacity className="mx-5 mb-8 flex-row items-center justify-center rounded-2xl bg-white py-4 active:bg-gray-50">
          <Ionicons name="log-out" size={20} color="#dc2626" />
          <Text className="ml-2 text-base font-semibold text-red-600">Cerrar Sesión</Text>
        </TouchableOpacity>

        <Typography variant="caption" color="muted" className="pb-8 text-center">
          Versión 1.0.0
        </Typography>
      </ScrollView>
    </Screen>
  );
}
