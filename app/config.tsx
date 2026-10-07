import { useState } from 'react';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useUser } from '@/hooks/useUser';
import { SETTINGS_GROUPS, type SettingsItem } from '@/constants/settings';
import Screen from '@/components/layout/Screen';
import Header from '@/components/layout/Header';
import { UserProfileHeader } from '@/components/settings/UserProfileHeader';
import { SettingsGroup } from '@/components/settings/SettingsGroup';
import Typography from '@/components/common/Typography';

export default function ConfigScreen() {
  const { user, updateUser } = useUser();
  const [saveError, setSaveError] = useState<string | null>(null);

  const toggleSetting = (key: SettingsItem['id']) => async (value: boolean) => {
    setSaveError(null);
    try {
      await updateUser({ settings: { [key]: value } });
    } catch (error) {
      console.error('Error saving setting:', error);
      // A failed write leaves the switch at the stored value, so show an error.
      setSaveError('No se pudo guardar el cambio. Intenta de nuevo.');
    }
  };

  const settings = {
    notifications: {
      value: user?.settings.notifications ?? false,
      onToggle: toggleSetting('notifications'),
    },
    biometric: { value: user?.settings.biometric ?? false, onToggle: toggleSetting('biometric') },
    darkMode: { value: user?.settings.darkMode ?? false, onToggle: toggleSetting('darkMode') },
  };

  return (
    <Screen background="gray" padding="none">
      <Header
        title="Configuración"
        variant="elevated"
        rightAction={{ icon: 'close', onPress: () => router.back() }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <UserProfileHeader user={user} />

        {saveError && (
          <Typography variant="body" color="error" className="mb-4 px-5 text-center">
            {saveError}
          </Typography>
        )}

        {SETTINGS_GROUPS.map((group) => (
          <SettingsGroup
            key={group.title}
            title={group.title}
            items={group.items}
            settings={settings}
          />
        ))}

        <Typography variant="caption" color="muted" className="pb-8 text-center">
          Versión 1.0.0
        </Typography>
      </ScrollView>
    </Screen>
  );
}
