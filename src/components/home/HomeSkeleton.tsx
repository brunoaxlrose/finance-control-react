import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Skeleton } from '../common/Skeleton';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';

export function HomeSkeleton({ onRefresh, refreshing = false }: { onRefresh?: () => void, refreshing?: boolean }) {
  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scroll}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          ) : undefined
        }
      >
        {/* HEADER SKELETON */}
        <View style={styles.header}>
          <View>
            <Skeleton width={150} height={24} style={{ marginBottom: 8 }} />
            <Skeleton width={200} height={16} />
          </View>
          <Skeleton width={40} height={40} borderRadius={RADIUS.full} />
        </View>

        {/* BALANCE CARD SKELETON */}
        <View style={styles.balanceCard}>
          <Skeleton width={80} height={14} style={{ marginBottom: 12 }} />
          <Skeleton width={220} height={40} style={{ marginBottom: 8 }} />
          <Skeleton width={100} height={14} style={{ marginBottom: 20 }} />
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Skeleton width={32} height={32} borderRadius={RADIUS.sm} style={{ marginBottom: 8 }} />
              <Skeleton width={60} height={12} style={{ marginBottom: 6 }} />
              <Skeleton width={80} height={18} />
            </View>
            <View style={styles.summaryItem}>
              <Skeleton width={32} height={32} borderRadius={RADIUS.sm} style={{ marginBottom: 8 }} />
              <Skeleton width={60} height={12} style={{ marginBottom: 6 }} />
              <Skeleton width={80} height={18} />
            </View>
          </View>
        </View>

        {/* QUICK ACTIONS SKELETON */}
        <View style={styles.quickActions}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.actionBtn}>
              <Skeleton width={52} height={52} borderRadius={RADIUS.md} style={{ marginBottom: 8 }} />
              <Skeleton width={50} height={12} />
            </View>
          ))}
        </View>

        {/* TRANSACTIONS SKELETON */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Skeleton width={140} height={20} />
            <Skeleton width={60} height={14} />
          </View>
          
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.cardSkeleton}>
              <Skeleton width={48} height={48} borderRadius={RADIUS.md} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Skeleton width="70%" height={16} style={{ marginBottom: 6 }} />
                <Skeleton width="40%" height={12} />
              </View>
              <Skeleton width={80} height={18} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg },
  balanceCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
  summaryRow: { flexDirection: 'row' },
  summaryItem: { flex: 1, alignItems: 'center' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg },
  actionBtn: { flex: 1, alignItems: 'center', marginHorizontal: 4 },
  section: {},
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  cardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
