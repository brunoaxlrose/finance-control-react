import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { TransactionType } from '../../types';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

type FilterType = TransactionType | 'all';

interface TransactionFilterProps {
  selected: FilterType;
  onSelect: (filter: FilterType) => void;
}

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Receitas', value: 'income' },
  { label: 'Despesas', value: 'expense' },
];

export function TransactionFilter({ selected, onSelect }: TransactionFilterProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.container}>
        {FILTERS.map(f => {
          const isActive = selected === f.value;
          const activeColor =
            f.value === 'income' ? COLORS.success :
            f.value === 'expense' ? COLORS.danger : COLORS.primary;
          return (
            <TouchableOpacity
              key={f.value}
              style={[styles.chip, isActive && { backgroundColor: activeColor + '25', borderColor: activeColor }]}
              onPress={() => onSelect(f.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, isActive && { color: activeColor }]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginBottom: SPACING.md },
  container: { flexDirection: 'row', gap: SPACING.sm, paddingRight: SPACING.md },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
});
