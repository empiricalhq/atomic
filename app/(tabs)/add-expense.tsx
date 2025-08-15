import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
  ScrollView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useTransactions } from '../../hooks/useTransactions';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import {
  categoryService,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../../services/CategoryService';
import { Transaction } from '../../types';

type TransactionType = 'expense' | 'income';

export default function AddExpenseScreen() {
  const params = useLocalSearchParams();
  const { addTransaction } = useTransactions();

  const [amount, setAmount] = useState((params.amount as string) || '0');
  const [description, setDescription] = useState((params.description as string) || '');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState((params.category as string) || '');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const selectedCategory = categories.find((cat) => cat.id === category) || categories[0];

  useEffect(() => {
    if (params.receiptData) {
      try {
        const receiptData = JSON.parse(params.receiptData as string);
        setDescription(receiptData.merchant || '');
        setAmount(receiptData.amount?.toString() || '0');
        // Could add more receipt data processing here
      } catch (error) {
        console.error('Error parsing receipt data:', error);
      }
    }
  }, [params.receiptData]);

  const handleNumberPress = (num: string) => {
    if (amount === '0' && num !== '.') {
      setAmount(num);
    } else if (amount.includes('.') && num === '.') {
      return; // Don't allow multiple decimal points
    } else if (amount.includes('.') && amount.split('.')[1].length >= 2) {
      return; // Don't allow more than 2 decimal places
    } else {
      setAmount(amount + num);
    }
  };

  const handleDelete = () => {
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount('0');
    }
  };

  const handleClear = () => {
    setAmount('0');
  };

  const handleSave = async () => {
    if (parseFloat(amount) <= 0) {
      return;
    }

    setIsLoading(true);
    try {
      const transactionData: Omit<Transaction, 'id' | 'userId'> = {
        amount: parseFloat(amount),
        description:
          description || `${type === 'expense' ? 'Gasto' : 'Ingreso'} en ${selectedCategory.name}`,
        category: selectedCategory.id,
        type,
        date: date,
        //notes: notes || undefined,
      };

      await addTransaction(transactionData);

      // Reset form
      setAmount('0');
      setDescription('');
      setNotes('');

      router.back();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateString = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva transacción</Text>
        <TouchableOpacity onPress={() => router.push('/scanner')} style={styles.headerButton}>
          <Ionicons name="camera" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Transaction Type Selector */}
        <Card style={styles.typeCard}>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
              onPress={() => {
                setType('expense');
                setCategory('');
              }}>
              <Ionicons
                name="remove-circle"
                size={24}
                color={type === 'expense' ? 'white' : '#FF3B30'}
              />
              <Text
                style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>
                Gasto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
              onPress={() => {
                setType('income');
                setCategory('');
              }}>
              <Ionicons
                name="add-circle"
                size={24}
                color={type === 'income' ? 'white' : '#34C759'}
              />
              <Text
                style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>
                Ingreso
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Amount Display */}
        <Card style={styles.amountCard}>
          <View style={styles.amountContainer}>
            <Text style={styles.currency}>$</Text>
            <Text style={[styles.amount, { color: type === 'expense' ? '#FF3B30' : '#34C759' }]}>
              {amount}
            </Text>
          </View>
        </Card>

        {/* Description Input */}
        <Card style={styles.detailsCard}>
          <Input
            label="Descripción"
            value={description}
            onChangeText={setDescription}
            placeholder={`¿En qué gastaste${type === 'income' ? ' o de dónde viene este ingreso' : ''}?`}
            icon="create-outline"
            containerStyle={styles.inputContainer}
          />

          {/* Category Selection */}
          <TouchableOpacity style={styles.categorySelector} onPress={() => setShowCategories(true)}>
            <View style={styles.categorySelectorLeft}>
              <View style={[styles.categoryIcon, { backgroundColor: selectedCategory.color }]}>
                <Ionicons name={selectedCategory.icon as any} size={20} color="white" />
              </View>
              <View>
                <Text style={styles.categoryLabel}>Categoría</Text>
                <Text style={styles.categoryName}>{selectedCategory.name}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          {/* Date Selection */}
          <View style={styles.dateSelector}>
            <Ionicons name="calendar-outline" size={20} color="#007AFF" />
            <View style={styles.dateSelectorContent}>
              <Text style={styles.dateLabel}>Fecha</Text>
              <Text style={styles.dateValue}>{formatDateString(date)}</Text>
            </View>
          </View>

          {/* Notes Button */}
          <TouchableOpacity style={styles.notesButton} onPress={() => setShowNotesInput(true)}>
            <Ionicons name="document-text-outline" size={20} color="#007AFF" />
            <Text style={styles.notesButtonText}>{notes ? 'Editar nota' : 'Agregar nota'}</Text>
            {notes && <Ionicons name="checkmark" size={16} color="#34C759" />}
          </TouchableOpacity>
        </Card>

        {/* Calculator */}
        <Card style={styles.calculatorCard}>
          <View style={styles.calculator}>
            <View style={styles.calculatorRow}>
              <TouchableOpacity style={styles.numberButton} onPress={() => handleNumberPress('1')}>
                <Text style={styles.numberText}>1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.numberButton} onPress={() => handleNumberPress('2')}>
                <Text style={styles.numberText}>2</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.numberButton} onPress={() => handleNumberPress('3')}>
                <Text style={styles.numberText}>3</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calculatorRow}>
              <TouchableOpacity style={styles.numberButton} onPress={() => handleNumberPress('4')}>
                <Text style={styles.numberText}>4</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.numberButton} onPress={() => handleNumberPress('5')}>
                <Text style={styles.numberText}>5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.numberButton} onPress={() => handleNumberPress('6')}>
                <Text style={styles.numberText}>6</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calculatorRow}>
              <TouchableOpacity style={styles.numberButton} onPress={() => handleNumberPress('7')}>
                <Text style={styles.numberText}>7</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.numberButton} onPress={() => handleNumberPress('8')}>
                <Text style={styles.numberText}>8</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.numberButton} onPress={() => handleNumberPress('9')}>
                <Text style={styles.numberText}>9</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calculatorRow}>
              <TouchableOpacity style={styles.numberButton} onPress={() => handleNumberPress('.')}>
                <Text style={styles.numberText}>.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.numberButton} onPress={() => handleNumberPress('0')}>
                <Text style={styles.numberText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
                <Ionicons name="backspace" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Button
          title={`Guardar ${type === 'expense' ? 'gasto' : 'ingreso'}`}
          onPress={handleSave}
          loading={isLoading}
          disabled={parseFloat(amount) <= 0}
          size="large"
          icon="checkmark"
          style={styles.saveButton}
        />
      </View>

      {/* Category Selection Modal */}
      <Modal visible={showCategories} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCategories(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Seleccionar categoría</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryOption,
                  cat.id === category && styles.categoryOptionSelected,
                ]}
                onPress={() => {
                  setCategory(cat.id);
                  setShowCategories(false);
                }}>
                <View style={[styles.categoryOptionIcon, { backgroundColor: cat.color }]}>
                  <Ionicons name={cat.icon as any} size={24} color="white" />
                </View>
                <Text style={styles.categoryOptionText}>{cat.name}</Text>
                {cat.id === category && <Ionicons name="checkmark" size={20} color="#007AFF" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Notes Input Modal */}
      <Modal visible={showNotesInput} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNotesInput(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nota</Text>
            <TouchableOpacity onPress={() => setShowNotesInput(false)}>
              <Text style={styles.modalSave}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Agregar una nota para esta transacción..."
              multiline
              textAlignVertical="top"
              autoFocus
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  typeCard: {
    marginBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  typeButtonTextActive: {
    color: 'white',
  },
  amountCard: {
    marginBottom: 20,
    paddingVertical: 32,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currency: {
    fontSize: 36,
    fontWeight: '300',
    color: '#8E8E93',
    marginRight: 8,
  },
  amount: {
    fontSize: 48,
    fontWeight: '300',
    letterSpacing: -1,
  },
  detailsCard: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  categorySelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  categoryName: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '600',
    marginTop: 2,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  dateSelectorContent: {
    marginLeft: 12,
  },
  dateLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '600',
    marginTop: 2,
  },
  notesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  notesButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  calculatorCard: {
    marginBottom: 20,
  },
  calculator: {
    gap: 16,
  },
  calculatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  numberButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  numberText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  actionButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  saveButton: {
    marginBottom: 0,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalCancel: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  modalSave: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  categoryOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F9FF',
  },
  categoryOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  notesInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1C1C1E',
    height: 120,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
});
