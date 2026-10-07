import { View, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Typography from '@/components/common/Typography';
import Card from '@/components/common/Card';
import { SettingsItem } from '@/constants/settings';

interface Props {
  title: string;
  items: SettingsItem[];
  settings: Record<SettingsItem['id'], { value: boolean; onToggle: (value: boolean) => void }>;
}

export function SettingsGroup({ title, items, settings }: Props) {
  return (
    <View className="mb-8 px-5">
      <Typography variant="overline" weight="semibold" color="secondary" className="mb-2 uppercase">
        {title}
      </Typography>
      <Card padding="none" variant="bordered" className="overflow-hidden">
        {items.map((item, itemIndex) => {
          const setting = settings[item.id];
          return (
            <View
              key={item.id}
              className={`flex-row items-center justify-between px-4 py-4 ${
                itemIndex !== items.length - 1 ? 'border-b border-gray-100' : ''
              }`}>
              <View className="flex-1 flex-row items-center">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                  <Ionicons name={item.icon} size={18} color="#475569" />
                </View>
                <View className="flex-1">
                  <Typography variant="body" weight="semibold">
                    {item.title}
                  </Typography>
                </View>
              </View>
              <View className="ml-3">
                <Switch
                  value={setting.value}
                  onValueChange={setting.onToggle}
                  trackColor={{ false: '#e2e8f0', true: '#475569' }}
                  thumbColor="white"
                  ios_backgroundColor="#e2e8f0"
                />
              </View>
            </View>
          );
        })}
      </Card>
    </View>
  );
}
