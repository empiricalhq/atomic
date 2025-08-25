import { View, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Typography from '@/components/common/Typography';
import Card from '@/components/common/Card';
import { SettingsItem } from '@/constants/settings';

interface Props {
  title: string;
  items: SettingsItem[];
  dynamicSettings?: Record<string, { value: boolean; onToggle: (value: boolean) => void }>;
}

export function SettingsGroup({ title, items, dynamicSettings = {} }: Props) {
  return (
    <View className="mb-8 px-5">
      <Typography variant="overline" weight="semibold" color="secondary" className="mb-2 uppercase">
        {title}
      </Typography>
      <Card padding="none" variant="bordered" className="overflow-hidden">
        {items.map((item, itemIndex) => {
          const dynamicProps = item.id ? dynamicSettings[item.id] : undefined;
          return (
            <TouchableOpacity
              key={itemIndex}
              className={`flex-row items-center justify-between px-4 py-4 active:bg-gray-50 ${
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
                {item.action === 'switch' && dynamicProps && (
                  <Switch
                    value={dynamicProps.value}
                    onValueChange={dynamicProps.onToggle}
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
          );
        })}
      </Card>
    </View>
  );
}
