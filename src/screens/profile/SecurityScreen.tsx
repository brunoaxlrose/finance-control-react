import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';
import { Card } from '../../components/common/Card';

export default function SecurityScreen({ navigation }: any) {
  const [biometrics, setBiometrics] = useState(false);
  const [hideBalance, setHideBalance] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Segurança</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        <Text style={styles.sectionTitle}>Autenticação</Text>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="lock" size={20} color={COLORS.primary} />
              <Text style={styles.rowText}>Login com Biometria</Text>
            </View>
            <Switch
              value={biometrics}
              onValueChange={setBiometrics}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.bg}
            />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Privacidade</Text>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="eye-off" size={20} color={COLORS.primary} />
              <Text style={styles.rowText}>Esconder saldo ao abrir app</Text>
            </View>
            <Switch
              value={hideBalance}
              onValueChange={setHideBalance}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.bg}
            />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Alertas</Text>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="shield" size={20} color={COLORS.primary} />
              <Text style={styles.rowText}>Alertas de novo login</Text>
            </View>
            <Switch
              value={loginAlerts}
              onValueChange={setLoginAlerts}
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  rowText: { color: COLORS.text, fontSize: 15, fontWeight: '500' },
});
