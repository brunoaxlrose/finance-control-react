import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton } from '../common/Skeleton';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';

export function ReportsSkeleton() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* HEADER SKELETON */}
        <View style={styles.header}>
          <Skeleton width={180} height={28} />
          <Skeleton width={100} height={14} style={{ marginTop: 6 }} />
        </View>

        {/* CHART SKELETON */}
        <View style={styles.chartCard}>
          <Skeleton width={120} height={18} style={{ marginBottom: 20 }} />
          <View style={styles.chartPlaceholder}>
            <Skeleton width={200} height={200} borderRadius={100} />
          </View>
          <View style={styles.legendRow}>
            <Skeleton width={100} height={14} />
            <Skeleton width={100} height={14} />
          </View>
        </View>

        {/* CATEGORY LIST SKELETON */}
        <View style={styles.section}>
          <Skeleton width={150} height={20} style={{ marginBottom: SPACING.md }} />
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.itemSkeleton}>
              <Skeleton width={40} height={40} borderRadius={RADIUS.md} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Skeleton width="50%" height={14} style={{ marginBottom: 6 }} />
                <Skeleton width="30%" height={10} />
              </View>
              <Skeleton width={60} height={14} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg },
  header: { marginBottom: SPACING.lg, paddingTop: 40 },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  chartPlaceholder: { marginVertical: 20 },
  legendRow: { flexDirection: 'row', gap: 20, marginTop: 10 },
  section: {},
  itemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
});
