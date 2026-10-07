import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '@/types';
import { getCategoryById } from '@/utils/categories';
import { formatCurrency, formatDate } from '@/utils/formatters';
import Typography from '@/components/common/Typography';

interface Props {
  transaction: Transaction;
  isLast: boolean;
}

export function TransactionListItem({ transaction, isLast }: Props) {
  const category = getCategoryById(transaction.category);

  return (
    <View className={`flex-row items-center p-4 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
        <Ionicons name={category?.icon ?? 'card'} size={16} color="#64748b" />
      </View>
      <View className="flex-1">
        <Typography variant="body" weight="semibold" className="mb-0.5" numberOfLines={1}>
          {transaction.description}
        </Typography>
        <Typography variant="caption" color="muted">
          {formatDate(transaction.date)}
        </Typography>
      </View>
      <Typography
        variant="body"
        weight="semibold"
        className={transaction.type === 'expense' ? 'text-gray-600' : 'text-green-600'}>
        {transaction.type === 'expense' ? '-' : '+'}
        {formatCurrency(transaction.amount)}
      </Typography>
    </View>
  );
}
