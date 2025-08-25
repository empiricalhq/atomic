import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '@/types';
import Typography from '@/components/common/Typography';

interface Props {
  user: User | null;
}

export function UserProfileHeader({ user }: Props) {
  return (
    <View className="mb-8 items-center bg-white py-8">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-gray-700">
        <Ionicons name="person" size={36} color="white" />
      </View>
      <Typography variant="h3" weight="semibold" className="mb-1">
        {user?.name || 'Usuario'}
      </Typography>
      <Typography variant="body" color="secondary">
        {user?.email || ''}
      </Typography>
    </View>
  );
}
