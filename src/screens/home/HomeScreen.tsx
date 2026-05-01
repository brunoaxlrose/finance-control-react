import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useFinance } from '../../contexts/FinanceContext';
import { TransactionCard } from '../../components/transactions/TransactionCard';
import { formatCurrency } from '../../utils/formatters';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';
import { getMonth, getYear } from 'date-fns';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { transactions, getBalance, getMonthSummary } = useFinance();

  const now = new Date();
  const balance = getBalance();
  const monthSummary = getMonthSummary(getMonth(now), getYear(now));
  const recent = transactions.slice(0, 5);
  const firstName = user?.name.split(' ')[0] ?? 'Usuário';

  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}, {firstName} 👋</Text>
            <Text style={styles.subGreeting}>Veja como estão suas finanças</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Transactions')}
          >
            <Feather name="bell" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* BALANCE CARD */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceGlow} />
          <Text style={styles.balanceLabel}>Saldo Total</Text>
          <Text style={[styles.balanceValue, { color: balance >= 0 ? COLORS.success : COLORS.danger }]}>
            {formatCurrency(balance)}
          </Text>
          <Text style={styles.balancePeriod}>Atualizado agora</Text>

          <View style={styles.balanceDivider} />

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: COLORS.success + '20' }]}>
                <Feather name="arrow-down-circle" size={16} color={COLORS.success} />
              </View>
              <Text style={styles.summaryLabel}>Receitas</Text>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                {formatCurrency(monthSummary.totalIncome)}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: COLORS.danger + '20' }]}>
                <Feather name="arrow-up-circle" size={16} color={COLORS.danger} />
              </View>
              <Text style={styles.summaryLabel}>Despesas</Text>
              <Text style={[styles.summaryValue, { color: COLORS.danger }]}>
                {formatCurrency(monthSummary.totalExpense)}
              </Text>
            </View>
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('AddTransaction', { type: 'income' })}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.success + '20' }]}>
              <Feather name="plus" size={20} color={COLORS.success} />
            </View>
            <Text style={styles.actionLabel}>Receita</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('AddTransaction', { type: 'expense' })}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.danger + '20' }]}>
              <Feather name="minus" size={20} color={COLORS.danger} />
            </View>
            <Text style={styles.actionLabel}>Despesa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Reports')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '20' }]}>
              <Feather name="pie-chart" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.actionLabel}>Relatórios</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Transactions')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.warning + '20' }]}>
              <Feather name="list" size={20} color={COLORS.warning} />
            </View>
            <Text style={styles.actionLabel}>Histórico</Text>
          </TouchableOpacity>
        </View>

        {/* RECENT TRANSACTIONS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimas Transações</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.seeAll}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {recent.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="inbox" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Nenhum lançamento ainda</Text>
              <Text style={styles.emptySubText}>Adicione sua primeira receita ou despesa</Text>
            </View>
          ) : (
            recent.map(t => <TransactionCard key={t.id} transaction={t} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.lg },
  greeting: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  subGreeting: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  notifBtn: {
    width: 40, height: 40, borderRadius: RADIUS.full,
    backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  balanceCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    position: 'relative',
  },
  balanceGlow: {
    position: 'absolute', top: -40, right: -40,
    width: 150, height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.primary + '15',
  },
  balanceLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  balanceValue: { fontSize: 36, fontWeight: '800', marginTop: SPACING.xs },
  balancePeriod: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  balanceDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
  summaryRow: { flexDirection: 'row' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryIcon: { width: 32, height: 32, borderRadius: RADIUS.sm, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  summaryLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  summaryValue: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.md },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg },
  actionBtn: { flex: 1, alignItems: 'center', marginHorizontal: 4 },
  actionIcon: {
    width: 52, height: 52, borderRadius: RADIUS.md,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  actionLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },
  section: {},
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  seeAll: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600', marginTop: SPACING.md },
  emptySubText: { color: COLORS.textMuted, fontSize: 13, marginTop: 4 },
});
