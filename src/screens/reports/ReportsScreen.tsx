import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useFinance } from '../../contexts/FinanceContext';
import { CATEGORIES } from '../../types';
import { formatCurrency, capitalize } from '../../utils/formatters';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';
import { getMonth, getYear } from 'date-fns';

const SCREEN_W = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: COLORS.card,
  backgroundGradientTo: COLORS.card,
  color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
  labelColor: () => COLORS.textSecondary,
  barPercentage: 0.6,
  useShadowColorFromDataset: false,
  propsForBackgroundLines: { stroke: COLORS.border },
  decimalPlaces: 0,
};

export default function ReportsScreen() {
  const { transactions, getMonthSummary, getAllMonthSummaries } = useFinance();
  const now = new Date();
  const summary = getMonthSummary(getMonth(now), getYear(now));
  const allSummaries = getAllMonthSummaries().slice(0, 6).reverse();

  const barData = useMemo(() => ({
    labels: allSummaries.map(s => capitalize(s.month).substring(0, 3)),
    datasets: [
      { data: allSummaries.map(s => s.totalIncome), color: () => COLORS.success },
      { data: allSummaries.map(s => s.totalExpense), color: () => COLORS.danger },
    ],
    legend: ['Receitas', 'Despesas'],
  }), [allSummaries]);

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount;
    });
    return Object.entries(map).map(([catId, value]) => {
      const cat = CATEGORIES.find(c => c.id === catId);
      return {
        name: cat?.name ?? 'Outros',
        population: value,
        color: cat?.color ?? COLORS.primary,
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 12,
      };
    });
  }, [transactions]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <Text style={styles.pageTitle}>Relatórios</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* MONTH SUMMARY */}
        <Text style={styles.sectionTitle}>Resumo do Mês</Text>
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, { borderColor: COLORS.success + '40' }]}>
            <Text style={styles.summaryCardLabel}>Receitas</Text>
            <Text style={[styles.summaryCardValue, { color: COLORS.success }]}>
              {formatCurrency(summary.totalIncome)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: COLORS.danger + '40' }]}>
            <Text style={styles.summaryCardLabel}>Despesas</Text>
            <Text style={[styles.summaryCardValue, { color: COLORS.danger }]}>
              {formatCurrency(summary.totalExpense)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: COLORS.primary + '40' }]}>
            <Text style={styles.summaryCardLabel}>Saldo</Text>
            <Text style={[styles.summaryCardValue, { color: summary.balance >= 0 ? COLORS.success : COLORS.danger }]}>
              {formatCurrency(summary.balance)}
            </Text>
          </View>
        </View>

        {/* BAR CHART */}
        {allSummaries.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Receitas vs Despesas</Text>
            <View style={styles.chartCard}>
              <BarChart
                data={barData}
                width={SCREEN_W - SPACING.lg * 4}
                height={200}
                chartConfig={chartConfig}
                style={styles.chart}
                fromZero
                showValuesOnTopOfBars={false}
                withInnerLines
                yAxisLabel="R$"
                yAxisSuffix=""
              />
            </View>
          </>
        )}

        {/* PIE CHART */}
        {expenseByCategory.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Despesas por Categoria</Text>
            <View style={styles.chartCard}>
              <PieChart
                data={expenseByCategory}
                width={SCREEN_W - SPACING.lg * 4}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[0, 0]}
                absolute={false}
              />
            </View>

            {/* LEGEND TABLE */}
            <View style={styles.legendTable}>
              {expenseByCategory
                .sort((a, b) => b.population - a.population)
                .map((item, i) => (
                  <View key={i} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.legendValue}>{formatCurrency(item.population)}</Text>
                  </View>
                ))}
            </View>
          </>
        )}

        {transactions.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Sem dados para exibir.</Text>
            <Text style={styles.emptySubText}>Adicione lançamentos para ver seus relatórios.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  pageTitle: {
    color: COLORS.text, fontSize: 22, fontWeight: '800',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.sm,
  },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.md, marginTop: SPACING.md },
  summaryCards: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.card,
    borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  summaryCardLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  summaryCardValue: { fontSize: 14, fontWeight: '800', marginTop: 4 },
  chartCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md, marginBottom: SPACING.sm, overflow: 'hidden',
  },
  chart: { borderRadius: RADIUS.md },
  legendTable: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md },
  legendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: SPACING.sm },
  legendName: { flex: 1, color: COLORS.text, fontSize: 14 },
  legendValue: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: SPACING.xxl * 2 },
  emptyText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
  emptySubText: { color: COLORS.textMuted, fontSize: 13, marginTop: 4 },
});
