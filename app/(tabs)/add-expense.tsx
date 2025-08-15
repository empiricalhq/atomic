import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AddExpenseScreen() {
  const [amount, setAmount] = useState('0');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('Categoría');

  const handleNumberPress = (num: string) => {
    if (amount === '0') {
      setAmount(num);
    } else {
      setAmount(amount + num);
    }
  };

  const handleClear = () => {
    setAmount('0');
  };

  const handleDelete = () => {
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount('0');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="close" size={24} color="#8E8E93" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagos</Text>
        <Text style={styles.headerSubtitle}>Gastos</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.currency}>$</Text>
        <Text style={styles.amount}>{amount}</Text>
      </View>

      <TouchableOpacity style={styles.addNoteButton}>
        <Ionicons name="create-outline" size={20} color="#007AFF" />
        <Text style={styles.addNoteText}>Add Note</Text>
      </TouchableOpacity>

      <View style={styles.detailsContainer}>
        <Text style={styles.dateText}>Hoy, 09 de agosto</Text>
        <TouchableOpacity style={styles.categoryButton}>
          <Text style={styles.categoryText}>{category}</Text>
          <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <View style={styles.calculator}>
        <View style={styles.row}>
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
        <View style={styles.row}>
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
        <View style={styles.row}>
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
        <View style={styles.row}>
          <TouchableOpacity style={styles.numberButton} onPress={() => handleNumberPress('.')}>
            <Text style={styles.numberText}>.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.numberButton} onPress={() => handleNumberPress('0')}>
            <Text style={styles.numberText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Ionicons name="backspace" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
  },
  currency: {
    fontSize: 48,
    fontWeight: '300',
    color: '#1C1C1E',
    marginRight: 8,
  },
  amount: {
    fontSize: 48,
    fontWeight: '300',
    color: '#1C1C1E',
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  addNoteText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 4,
  },
  calculator: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  numberButton: {
    width: '30%',
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  numberText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#1C1C1E',
  },
  actionButton: {
    width: '30%',
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
