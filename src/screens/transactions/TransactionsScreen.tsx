import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useFinance } from '../../contexts/FinanceContext';
import { TransactionsSkeleton } from '../../components/transactions/TransactionsSkeleton';
import { TransactionType } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../utils/theme';
import { format, addMonths, subMonths, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { LoadingOverlay } from '../../components/common/LoadingOverlay';

export default function TransactionsScreen({ navigation }: any) {
  const { transactions, categories, updateTransaction, getBalance, getMonthSummary, refreshTransactions, isLoading: isFinanceLoading } = useFinance();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const currentMonth = getMonth(currentDate);
  const currentYear = getYear(currentDate);
  
  const filtered = transactions.filter(t => {
    const d = new Date(`${t.date.substring(0,10)}T12:00:00`);
    const isSameMonth = getMonth(d) === currentMonth && getYear(d) === currentYear;
    if (t.isFixed && t.type === 'expense') return true;
    return isSameMonth;
  });

  const summary = getMonthSummary(currentMonth, currentYear);
  const currentBalance = getBalance();

  function nextMonth() { setCurrentDate(addMonths(currentDate, 1)); }
  function prevMonth() { setCurrentDate(subMonths(currentDate, 1)); }

  // Função para agrupar as transações por data
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: typeof filtered } = {};
    
    // Ordenar por data (mais recente primeiro)
    const sorted = [...filtered].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    sorted.forEach(t => {
      const dateKey = format(new Date(`${t.date.substring(0,10)}T12:00:00`), 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });

    return Object.entries(groups).map(([date, data]) => ({
      date,
      title: format(new Date(`${date}T12:00:00`), "EEEE, dd", { locale: ptBR }),
      data
    }));
  }, [filtered]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshTransactions();
    setRefreshing(false);
  }, [refreshTransactions]);

  if (isFinanceLoading && transactions.length === 0) {
    return <TransactionsSkeleton />;
  }

  async function togglePaidStatus(t: any) {
    const isFuture = new Date(`${t.date.substring(0,10)}T12:00:00`) > new Date();
    if (isFuture) {
      Toast.show({ 
        type: 'info', 
        text1: 'Atenção', 
        text2: 'Não é possível marcar lançamentos futuros como pagos.' 
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateTransaction({ ...t, isPaid: !t.isPaid });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={isLoading} message="Atualizando status..." />

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

      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.card}
          />
        }
      >
        
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

        {/* TRANSACTIONS LIST GROUPED BY DAY */}
        <View style={styles.listContainer}>
          {groupedTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Nenhum lançamento encontrado</Text>
            </View>
          ) : (
            groupedTransactions.map((group) => (
              <View key={group.date} style={styles.dayGroup}>
                <Text style={styles.dayTitle}>{group.title}</Text>
                {group.data.map((t) => {
                  const cat = categories.find(c => c.id === t.categoryId);
                  const isPaid = t.isPaid !== false;
                  const isFuture = new Date(`${t.date.substring(0,10)}T12:00:00`) > new Date();
                  const hasInstallments = t.totalInstallments && t.totalInstallments > 1;
                  return (
                    <TouchableOpacity 
                      key={t.id} 
                      style={[styles.transactionCard, isFuture && styles.futureCard]}
                      onPress={() => navigation.navigate('Home', { screen: 'AddTransaction', params: { transaction: t } })}
                      activeOpacity={0.7}
                    >
                      {/* Left: icon */}
                      <View style={[styles.iconContainer, { backgroundColor: cat?.color ?? COLORS.textMuted }]}>
                        <Feather name={(cat?.icon as any) ?? 'help-circle'} size={20} color={COLORS.white} />
                      </View>

                      {/* Middle: info */}
                      <View style={styles.contentContainer}>
                        <Text style={styles.description} numberOfLines={1}>
                          {t.description}
                          {hasInstallments && (
                            <Text style={styles.installmentText}> ({t.installmentNumber}/{t.totalInstallments})</Text>
                          )}
                        </Text>
                        <View style={styles.tagsRow}>
                          <Text style={styles.categoryName}>{cat?.name ?? 'Sem Categoria'}</Text>
                          {t.isFixed && (
                            <View style={styles.tag}>
                              <Text style={styles.tagText}>Fixa</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Right: amount + check */}
                      <View style={styles.amountContainer}>
                        <Text style={[
                          styles.amount, 
                          { color: t.type === 'income' ? COLORS.success : isFuture ? COLORS.textSecondary : COLORS.text }
                        ]}>
                          {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                        </Text>
                        <TouchableOpacity 
                          onPress={() => togglePaidStatus(t)}
                          style={[styles.checkCircle, isPaid && !isFuture && { backgroundColor: COLORS.success, borderColor: COLORS.success }]}
                        >
                          {isPaid && !isFuture && <Feather name="check" size={11} color={COLORS.white} />}
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
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
  scroll: { paddingBottom: 100, flexGrow: 1 },
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
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
    ...SHADOW.sm,
    gap: SPACING.sm,
  },
  futureCard: {
    opacity: 0.75,
    borderStyle: 'dashed',
  },
  checkCircle: { 
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, 
    borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center',
    marginTop: 4,
  },
  iconContainer: { 
    width: 44, height: 44, borderRadius: RADIUS.md, 
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  contentContainer: { flex: 1, minWidth: 0 },
  description: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  installmentText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  tagsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' },
  categoryName: { fontSize: 12, color: COLORS.textSecondary },
  tag: {
    paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.primary + '15',
  },

  amountContainer: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  amount: { fontSize: 14, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { color: COLORS.textMuted, fontSize: 15, marginTop: SPACING.md },
  dayGroup: { marginBottom: SPACING.md },
  dayTitle: { 
    color: COLORS.textSecondary, 
    fontSize: 13, 
    fontWeight: '700', 
    marginBottom: SPACING.sm, 
    textTransform: 'capitalize',
    marginTop: SPACING.sm,
    letterSpacing: 0.5,
  },
});
