import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';
import { useFinance } from '../../contexts/FinanceContext';
import { Card } from '../../components/common/Card';

export default function TransactionDetailScreen({ route, navigation }: any) {
  const { transaction } = route.params;
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
        onConfirm: async () => {
          Toast.hide();
          await removeTransaction(transaction.id);
          navigation.goBack();
          Toast.show({ type: 'success', text1: 'Excluído', text2: 'O lançamento foi removido.' });
        }
      }
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Feather name="trash-2" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* AMOUNT HERO */}
        <View style={styles.hero}>
          <View style={[styles.iconBig, { backgroundColor: (category?.color ?? COLORS.primary) + '25' }]}>
            <Feather name={(category?.icon as any) ?? 'circle'} size={36} color={category?.color ?? COLORS.primary} />
          </View>
          <Text style={[styles.amount, { color: isIncome ? COLORS.success : COLORS.danger }]}>
            {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
          </Text>
          <Text style={styles.heroDesc}>{transaction.description}</Text>
          <View style={[styles.badge, { backgroundColor: isIncome ? COLORS.success + '20' : COLORS.danger + '20' }]}>
            <Text style={[styles.badgeText, { color: isIncome ? COLORS.success : COLORS.danger }]}>
              {isIncome ? 'Receita' : 'Despesa'}
            </Text>
          </View>
        </View>

        {/* DETAILS */}
        <Card style={styles.details}>
          <Row icon="tag" label="Categoria" value={category?.name ?? 'Outros'} />
          <View style={styles.divider} />
          <Row icon="calendar" label="Data" value={formatDate(transaction.date)} />
          <View style={styles.divider} />
          <Row icon="clock" label="Criado em" value={formatDate(transaction.createdAt)} />
          <View style={styles.divider} />
          <Row icon="hash" label="ID" value={transaction.id} />
        </Card>
      </ScrollView>
    </View>
  );
}

function Row({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.left}>
        <Feather name={icon} size={16} color={COLORS.textSecondary} />
        <Text style={rowStyles.label}>{label}</Text>
      </View>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { color: COLORS.textSecondary, fontSize: 14 },
  value: { color: COLORS.text, fontSize: 14, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md,
  },
  back: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  deleteBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  hero: { alignItems: 'center', paddingVertical: SPACING.xxl },
  iconBig: { width: 80, height: 80, borderRadius: RADIUS.xl, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  amount: { fontSize: 36, fontWeight: '800', marginBottom: SPACING.sm },
  heroDesc: { color: COLORS.textSecondary, fontSize: 16, marginBottom: SPACING.md },
  badge: { paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full },
  badgeText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  details: { marginTop: SPACING.sm },
  divider: { height: 1, backgroundColor: COLORS.border },
});
