import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { GetProblemsParams } from '../../../shared/api/endpoints/problems.api';
import { colors, spacing, borderRadius } from '../../../shared/styles/theme';
import { globalStyles } from '../../../shared/styles/globalStyles';

interface ProblemFilterProps {
  filters: GetProblemsParams;
  onFilterChange: (filters: Partial<GetProblemsParams>) => void;
}

/**
 * 문제 필터 컴포넌트
 * 태그, 난이도, 상태 필터링 지원
 */
export const ProblemFilter: React.FC<ProblemFilterProps> = ({ filters, onFilterChange }) => {
  const difficulties = ['bronze_5', 'silver_5', 'gold_5', 'platinum_5', 'diamond_5'];
  const statuses = ['unsolved', 'attempted', 'solved'] as const;

  return (
    <YStack padding={spacing.md} backgroundColor={colors.backgroundSecondary}>
      {/* 난이도 필터 */}
      <Text style={styles.filterLabel}>난이도</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <XStack gap={spacing.sm}>
          {difficulties.map((diff) => (
            <TouchableOpacity
              key={diff}
              style={[
                styles.filterChip,
                filters.difficulty === diff && styles.filterChipActive,
              ]}
              onPress={() => onFilterChange({ difficulty: filters.difficulty === diff ? undefined : diff })}
            >
              <Text style={styles.filterChipText}>{diff}</Text>
            </TouchableOpacity>
          ))}
        </XStack>
      </ScrollView>

      {/* 상태 필터 */}
      <Text style={[styles.filterLabel, { marginTop: spacing.md }]}>상태</Text>
      <XStack gap={spacing.sm}>
        {statuses.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              filters.status === status && styles.filterChipActive,
            ]}
            onPress={() => onFilterChange({ status: filters.status === status ? undefined : status })}
          >
            <Text style={styles.filterChipText}>
              {status === 'solved' ? '해결' : status === 'attempted' ? '시도' : '미해결'}
            </Text>
          </TouchableOpacity>
        ))}
      </XStack>
    </YStack>
  );
};

const styles = StyleSheet.create({
  filterLabel: {
    ...globalStyles.textSecondary,
    marginBottom: spacing.sm,
  },
  filterScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...globalStyles.textSecondary,
    fontSize: 12,
  },
});

