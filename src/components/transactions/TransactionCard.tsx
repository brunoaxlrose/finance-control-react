import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { Transaction, CATEGORIES } from '../../types';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';
import { useFinance } from '../../contexts/FinanceContext';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
  showDelete?: boolean;
}

export function TransactionCard({ transaction, onPress, showDelete = false }: TransactionCardProps) {
  const { removeTransaction } = useFinance();
  const category = CATEGORIES.find(c => c.id === transaction.categoryId);
  const isIncome = transaction.type === 'income';

  function handleDelete() {
    Toast.show({
      type: 'confirm',
      text1: 'Excluir lançamento',
      text2: 'Tem certeza que deseja excluir este lançamento?',
      position: 'bottom',
      bottomOffset: 40,
      autoHide: false,
      props: {
        cancelText: 'Cancelar',
        confirmText: 'Excluir',
        danger: true,
        onCancel: () => Toast.hide(),
        onConfirm: () => {
          Toast.hide();
          removeTransaction(transaction.id);
          Toast.show({ type: 'success', text1: 'Excluído', text2: 'Lançamento apagado.' });
        }
      }
    });
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconWrapper, { backgroundColor: (category?.color ?? COLORS.primary) + '20' }]}>
        <Feather
          name={(category?.icon as any) ?? 'circle'}
          size={20}
          color={category?.color ?? COLORS.primary}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>{transaction.description}</Text>
        <Text style={styles.category}>{category?.name ?? 'Outros'} · {formatDateShort(transaction.date)}</Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: isIncome ? COLORS.success : COLORS.danger }]}>
          {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
        </Text>
        {showDelete && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Feather name="trash-2" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  info: { flex: 1 },
  description: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  category: { color: COLORS.textSecondary, fontSize: 12 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 14, fontWeight: '700' },
  deleteBtn: { marginTop: 4, padding: 4 },
});
