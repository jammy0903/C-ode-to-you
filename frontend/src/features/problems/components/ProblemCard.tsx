import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Problem } from '../../../shared/types/api.types';
import { colors, spacing, borderRadius, fontSize } from '../../../shared/styles/theme';
import { globalStyles } from '../../../shared/styles/globalStyles';
import {
  getTierColor,
  getStatusColor,
  getStatusIcon,
  calculateAcceptanceRate,
} from '../utils/problemUtils';

interface ProblemCardProps {
  problem: Problem;
  onPress: () => void;
}

/**
 * 문제 카드 컴포넌트
 * 문제 번호, 제목, 난이도, 태그 등을 표시
 */
export const ProblemCard: React.FC<ProblemCardProps> = ({ problem, onPress }) => {

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom={spacing.sm}>
        <YStack flex={1}>
          <XStack alignItems="center" gap={spacing.sm} marginBottom={spacing.xs}>
            <Text style={styles.problemNumber}>#{problem.number}</Text>
            <View style={[styles.tierBadge, { backgroundColor: getTierColor(problem.difficulty) }]}>
              <Text style={styles.tierText}>{problem.difficulty}</Text>
            </View>
          </XStack>
          <Text style={styles.title}>{problem.title}</Text>
        </YStack>
        {problem.userStatus && (
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(problem.userStatus) }]}>
            <Text style={styles.statusText}>
              {getStatusIcon(problem.userStatus)}
            </Text>
          </View>
        )}
      </XStack>

      {/* 태그 */}
      {problem.tags && problem.tags.length > 0 && (
        <XStack flexWrap="wrap" gap={spacing.xs} marginTop={spacing.sm}>
          {problem.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </XStack>
      )}

      {/* 통계 */}
      <XStack marginTop={spacing.sm} gap={spacing.md}>
        <Text style={styles.stats}>
          정답률: {calculateAcceptanceRate(problem.acceptedCount, problem.submissionCount)}%
        </Text>
        {problem.userAttempts !== undefined && (
          <Text style={styles.stats}>시도: {problem.userAttempts}회</Text>
        )}
      </XStack>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    ...globalStyles.card,
    marginBottom: spacing.md,
  },
  problemNumber: {
    ...globalStyles.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  tierBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tierText: {
    ...globalStyles.text,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  title: {
    ...globalStyles.heading3,
    marginTop: spacing.xs,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
  tag: {
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    ...globalStyles.textTertiary,
    fontSize: fontSize.xs,
  },
  stats: {
    ...globalStyles.textTertiary,
    fontSize: fontSize.xs,
  },
});

