import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Submission } from '../../../shared/types/api.types';
import { colors, spacing, borderRadius, createShadow } from '../../../shared/styles/theme';
import { globalStyles } from '../../../shared/styles/globalStyles';
import { VerdictBadge } from './VerdictBadge';

interface SubmissionCardProps {
  submission: Submission;
  onPress?: () => void;
}

/**
 * 제출 카드 컴포넌트 (미래지향적 디자인)
 */
export const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <XStack justifyContent="space-between" alignItems="center">
        <YStack flex={1}>
          <XStack alignItems="center" gap={spacing.sm} marginBottom={spacing.xs}>
            <VerdictBadge status={submission.status} />
            <Text style={styles.date}>
              {new Date(submission.createdAt).toLocaleString('ko-KR')}
            </Text>
          </XStack>
          {submission.executionTime !== undefined && (
            <XStack gap={spacing.md}>
              <Text style={styles.meta}>
                ⏱ {submission.executionTime}ms
              </Text>
              {submission.memoryUsage !== undefined && (
                <Text style={styles.meta}>
                  💾 {submission.memoryUsage}MB
                </Text>
              )}
            </XStack>
          )}
        </YStack>
      </XStack>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0d1117',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#1a1a2e',
    ...createShadow(0, 0, 8, 0, '#00ffff', 0.2),
  },
  date: {
    ...globalStyles.textTertiary,
    fontSize: 11,
  },
  meta: {
    ...globalStyles.textSecondary,
    fontSize: 11,
  },
});

