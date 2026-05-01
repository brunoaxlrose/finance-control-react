import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFinance } from '../../contexts/FinanceContext';
import { TransactionType } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../utils/theme';
import { format, addMonths, subMonths, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TransactionsScreen({ navigation }: any) {
  const { transactions, categories, updateTransaction, getBalance, getMonthSummary } = useFinance();
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = getMonth(currentDate);
  const currentYear = getYear(currentDate);
  
  const filtered = transactions.filter(t => {
    const d = new Date(t.date);
    return getMonth(d) === currentMonth && getYear(d) === currentYear;
  });

  const summary = getMonthSummary(currentMonth, currentYear);
  const currentBalance = getBalance();

  function nextMonth() { setCurrentDate(addMonths(currentDate, 1)); }
  function prevMonth() { setCurrentDate(subMonths(currentDate, 1)); }

  async function togglePaidStatus(t: any) {
    await updateTransaction({ ...t, isPaid: !t.isPaid });
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</Text>
          <Text style={styles.headerTitle}>Lançamentos</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('Home', { screen: 'AddTransaction' })}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* SUMMARY CARDS */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { borderLeftWidth: 5, borderLeftColor: COLORS.primary }]}>
            <Text style={styles.summaryLabel}>Saldo Disponível</Text>
            <Text style={styles.summaryValue}>{formatCurrency(currentBalance)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={[styles.miniCard, { backgroundColor: COLORS.success + '15' }]}>
              <Feather name="arrow-down" size={14} color={COLORS.success} />
              <Text style={[styles.miniValue, { color: COLORS.success }]}>{formatCurrency(summary.totalIncome)}</Text>
            </View>
            <View style={[styles.miniCard, { backgroundColor: COLORS.danger + '15' }]}>
              <Feather name="arrow-up" size={14} color={COLORS.danger} />
              <Text style={[styles.miniValue, { color: COLORS.danger }]}>{formatCurrency(summary.totalExpense)}</Text>
            </View>
          </View>
        </View>

        {/* MONTH SELECTOR */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={prevMonth} style={styles.monthNavBtn}>
            <Feather name="chevron-left" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.monthNavText}>{format(currentDate, 'MMMM', { locale: ptBR })}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.monthNavBtn}>
            <Feather name="chevron-right" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* TRANSACTIONS LIST */}
        <View style={styles.listContainer}>
          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Nenhum lançamento encontrado</Text>
            </View>
          ) : (
            filtered.map((t) => {
              const cat = categories.find(c => c.id === t.categoryId);
              const isPaid = t.isPaid !== false;
              return (
                <TouchableOpacity 
                  key={t.id} 
                  style={styles.transactionCard}
                  onPress={() => navigation.navigate('Home', { screen: 'AddTransaction', params: { transaction: t } })}
                  activeOpacity={0.7}
                >
                  <TouchableOpacity 
                    style={styles.statusIcon} 
                    onPress={() => togglePaidStatus(t)}
                  >
                    <View style={[
                      styles.checkCircle, 
                      isPaid && { backgroundColor: COLORS.success, borderColor: COLORS.success }
                    ]}>
                      {isPaid && <Feather name="check" size={12} color={COLORS.white} />}
                    </View>
                  </TouchableOpacity>

                  <View style={[styles.iconContainer, { backgroundColor: cat?.color ?? COLORS.textMuted }]}>
                    <Feather name={(cat?.icon as any) ?? 'help-circle'} size={18} color={COLORS.white} />
                  </View>

                  <View style={styles.contentContainer}>
                    <Text style={styles.description} numberOfLines={1}>{t.description}</Text>
                    <Text style={styles.categoryName}>{cat?.name ?? 'Sem Categoria'} • {format(new Date(t.date), 'dd MMM')}</Text>
                  </View>

                  <View style={styles.amountContainer}>
                    <Text style={[
                      styles.amount, 
                      { color: t.type === 'income' ? COLORS.success : COLORS.text }
                    ]}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </Text>
                    {t.isFixed && <Feather name="repeat" size={10} color={COLORS.textMuted} />}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: 60, paddingBottom: SPACING.md,
  },
  headerSubtitle: { color: COLORS.textSecondary, fontSize: 13, textTransform: 'capitalize', fontWeight: '600' },
  headerTitle: { color: COLORS.text, fontSize: 26, fontWeight: '800' },
  addBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    ...SHADOW.md,
  },
  scroll: { paddingBottom: 100 },
  summaryContainer: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  summaryCard: { 
    padding: SPACING.lg, borderRadius: RADIUS.xl, marginBottom: SPACING.md,
    ...SHADOW.lg,
  },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  summaryValue: { color: COLORS.white, fontSize: 32, fontWeight: '800', marginTop: 4 },
  summaryRow: { flexDirection: 'row', gap: SPACING.md },
  miniCard: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    padding: 14, borderRadius: RADIUS.lg, gap: 8, backgroundColor: COLORS.bgSecondary,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm
  },
  miniValue: { fontSize: 14, fontWeight: '700' },
  monthSelector: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    marginBottom: SPACING.md, gap: SPACING.xl 
  },
  monthNavBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOW.sm },
  monthNavText: { fontSize: 16, fontWeight: '700', color: COLORS.text, textTransform: 'capitalize' },
  listContainer: { paddingHorizontal: SPACING.lg },
  transactionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgSecondary,
    padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  statusIcon: { marginRight: SPACING.md },
  checkCircle: { 
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, 
    borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' 
  },
  iconContainer: { 
    width: 40, height: 40, borderRadius: RADIUS.md, 
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md 
  },
  contentContainer: { flex: 1 },
  description: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  categoryName: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  amountContainer: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 15, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { color: COLORS.textMuted, fontSize: 15, marginTop: SPACING.md },
});
