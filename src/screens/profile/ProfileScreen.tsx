import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useFinance } from '../../contexts/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';
import { Card } from '../../components/common/Card';
import { getMonth, getYear } from 'date-fns';

export default function ProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const { transactions, getBalance, getMonthSummary } = useFinance();
  const now = new Date();
  const summary = getMonthSummary(getMonth(now), getYear(now));
  const balance = getBalance();

  const initial = user?.name?.charAt(0).toUpperCase() ?? 'U';

  function handleLogout() {
    if (Platform.OS === 'web') {
      if (window.confirm('Deseja realmente sair da sua conta?')) {
        signOut();
      }
    } else {
      Toast.show({
        type: 'confirm',
        text1: 'Sair da conta?',
        text2: 'Deseja encerrar sua sessão com segurança?',
        position: 'bottom',
        bottomOffset: 40,
        autoHide: false,
        props: {
          cancelText: 'Cancelar',
          confirmText: 'Sair',
          danger: true,
          onCancel: () => Toast.hide(),
          onConfirm: () => { Toast.hide(); signOut(); }
        }
      });
    }
  }

  function handleMenuPress(label: string, routeName?: string) {
    if (routeName) {
      navigation.navigate(routeName);
      return;
    }
    
    Toast.show({
      type: 'info',
      text1: 'Em Breve',
      text2: `As configurações de ${label} estarão disponíveis na próxima atualização.`,
      position: 'bottom',
      bottomOffset: 80,
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Perfil</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* AVATAR */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* STATS */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: balance >= 0 ? COLORS.success : COLORS.danger }]}>
                {formatCurrency(balance)}
              </Text>
              <Text style={styles.statLabel}>Saldo Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: COLORS.danger }]}>
                {formatCurrency(summary.totalExpense)}
              </Text>
              <Text style={styles.statLabel}>Gastos/mês</Text>
            </View>
          </View>
        </Card>

        {/* MENU */}
        <Card style={styles.menuCard}>
          <MenuItem icon="user" label="Dados da conta" onPress={() => handleMenuPress('Dados da Conta', 'AccountDetails')} />
          <View style={styles.menuDivider} />
          <MenuItem icon="bell" label="Notificações" onPress={() => handleMenuPress('Notificações', 'Notifications')} />
          <View style={styles.menuDivider} />
          <MenuItem icon="grid" label="Categorias" onPress={() => handleMenuPress('Categorias', 'Categories')} />
          <View style={styles.menuDivider} />
          <MenuItem icon="lock" label="Segurança" onPress={() => handleMenuPress('Segurança', 'Security')} />
          <View style={styles.menuDivider} />
          <MenuItem icon="help-circle" label="Ajuda & Suporte" onPress={() => handleMenuPress('Ajuda & Suporte')} />
          <View style={styles.menuDivider} />
          <MenuItem icon="info" label="Sobre o app" onPress={() => handleMenuPress('Sobre o App')} />
        </Card>

        {/* VERSION */}
        <Text style={styles.version}>v1.0.0</Text>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Feather name="log-out" size={18} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function MenuItem({ icon, label, onPress }: { icon: any; label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={styles.menuIcon}>
          <Feather name={icon} size={16} color={COLORS.primary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  pageTitle: {
    color: COLORS.text, fontSize: 22, fontWeight: '800',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.sm,
  },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  profileSection: { alignItems: 'center', paddingVertical: SPACING.xl },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary + '30',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: COLORS.primary,
    marginBottom: SPACING.md,
  },
  avatarText: { color: COLORS.primary, fontSize: 30, fontWeight: '800' },
  name: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  email: { color: COLORS.textSecondary, fontSize: 14, marginTop: 4 },
  statsCard: { marginBottom: SPACING.md },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm },
  statValue: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 2, textTransform: 'uppercase' },
  statDivider: { width: 1, height: 40, backgroundColor: COLORS.border },
  menuCard: { padding: 0, overflow: 'hidden', marginBottom: SPACING.md },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  menuIcon: {
    width: 32, height: 32, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  menuLabel: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.md },
  version: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', marginBottom: SPACING.lg },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, paddingVertical: SPACING.md,
    backgroundColor: COLORS.danger + '15',
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.danger + '30',
  },
  logoutText: { color: COLORS.danger, fontSize: 15, fontWeight: '700' },
});
