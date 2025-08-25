import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '@/types';
import { getCategoryById } from '@/api/categoryService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import Typography from '@/components/common/Typography';

interface Props {
  transaction: Transaction;
  onPress: () => void;
  isLast: boolean;
}

export function TransactionListItem({ transaction, onPress, isLast }: Props) {
  const category = getCategoryById(transaction.category);

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center p-4 ${!isLast ? 'border-b border-gray-100' : ''}`}
      activeOpacity={0.7}>
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
        <Ionicons name={(category?.icon as any) || 'card'} size={16} color="#64748b" />
      </View>
      <View className="flex-1">
        <Typography variant="body" weight="semibold" className="mb-0.5" numberOfLines={1}>
          {transaction.description}
        </Typography>
        <Typography variant="caption" color="muted">
          {formatDate(new Date(transaction.date))}
        </Typography>
      </View>
      <Typography
        variant="body"
        weight="semibold"
        className={transaction.type === 'expense' ? 'text-gray-600' : 'text-green-600'}>
        {transaction.type === 'expense' ? '-' : '+'}
        {formatCurrency(transaction.amount)}
      </Typography>
    </TouchableOpacity>
  );
}
