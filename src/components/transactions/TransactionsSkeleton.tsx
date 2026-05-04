import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton } from '../common/Skeleton';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';

export function TransactionsSkeleton() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* HEADER SKELETON */}
        <View style={styles.header}>
          <View>
            <Skeleton width={100} height={14} style={{ marginBottom: 6 }} />
            <Skeleton width={180} height={28} />
          </View>
          <Skeleton width={48} height={48} borderRadius={24} />
        </View>

        {/* SUMMARY CARDS SKELETON */}
        <View style={styles.summaryContainer}>
          <Skeleton width="100%" height={90} borderRadius={RADIUS.xl} style={{ marginBottom: SPACING.md }} />
          <View style={styles.summaryRow}>
            <Skeleton width="48%" height={50} borderRadius={RADIUS.lg} />
            <Skeleton width="48%" height={50} borderRadius={RADIUS.lg} />
          </View>
        </View>

        {/* MONTH SELECTOR SKELETON */}
        <View style={styles.monthSelector}>
          <Skeleton width={32} height={32} borderRadius={16} />
          <Skeleton width={100} height={18} />
          <Skeleton width={32} height={32} borderRadius={16} />
        </View>

        {/* LIST SKELETON */}
        <View style={styles.listContainer}>
          {[1, 2].map((group) => (
            <View key={group} style={styles.dayGroup}>
              <Skeleton width={120} height={16} style={{ marginBottom: SPACING.sm, marginTop: SPACING.sm }} />
              {[1, 2, 3].map((item) => (
                <View key={item} style={styles.cardSkeleton}>
                  <Skeleton width={44} height={44} borderRadius={RADIUS.md} style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Skeleton width="60%" height={16} style={{ marginBottom: 6 }} />
                    <Skeleton width="40%" height={12} />
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Skeleton width={80} height={16} style={{ marginBottom: 6 }} />
                    <Skeleton width={22} height={22} borderRadius={11} />
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 100 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: 60, paddingBottom: SPACING.md,
  },
  summaryContainer: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  monthSelector: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    marginBottom: SPACING.md, gap: SPACING.xl 
  },
  listContainer: { paddingHorizontal: SPACING.lg },
  dayGroup: { marginBottom: SPACING.md },
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
