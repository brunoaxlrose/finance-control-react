import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';
import { Card } from '../../components/common/Card';

export default function NotificationsScreen({ navigation }: any) {
  const [expenseAlerts, setExpenseAlerts] = useState(true);
  const [incomeAlerts, setIncomeAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        <Text style={styles.sectionTitle}>Transações</Text>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="arrow-up-circle" size={20} color={COLORS.danger} />
              <Text style={styles.rowText}>Aviso de Despesas</Text>
            </View>
            <Switch
              value={expenseAlerts}
              onValueChange={setExpenseAlerts}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.bg}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="arrow-down-circle" size={20} color={COLORS.success} />
              <Text style={styles.rowText}>Aviso de Receitas</Text>
            </View>
            <Switch
              value={incomeAlerts}
              onValueChange={setIncomeAlerts}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.bg}
            />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Relatórios</Text>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="file-text" size={20} color={COLORS.primary} />
              <Text style={styles.rowText}>Resumo Semanal</Text>
            </View>
            <Switch
              value={weeklyReport}
              onValueChange={setWeeklyReport}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.bg}
            />
          </View>
        </Card>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md,
  },
  backBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, paddingTop: SPACING.md },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: SPACING.sm, marginTop: SPACING.md },
  card: { padding: SPACING.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.xs },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  rowText: { color: COLORS.text, fontSize: 15, fontWeight: '500' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
});
