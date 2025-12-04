import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { YStack } from 'tamagui';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';
import { useUserStats } from '../hooks/useUserStats';
import { Loading } from '../../../shared/components/Loading';
import { colors, spacing } from '../../../shared/styles/theme';
import { globalStyles } from '../../../shared/styles/globalStyles';

/**
 * 프로필 화면
 * 사용자 통계, 활동 기록 표시
 */
export const ProfileScreen: React.FC = () => {
  const { stats, activity, isLoading, refresh } = useUserStats();

  if (isLoading) {
    return <Loading fullScreen message="프로필을 불러오는 중..." />;
  }

  return (
    <ScreenContainer>
      <YStack gap={spacing.lg}>
        {/* 통계 카드 */}
        {stats && (
          <YStack backgroundColor={colors.surface} padding={spacing.lg} borderRadius={12}>
            <Text style={styles.sectionTitle}>통계</Text>
            <YStack marginTop={spacing.md} gap={spacing.sm}>
              <Text style={styles.statText}>해결한 문제: {stats.solvedCount}개</Text>
              <Text style={styles.statText}>제출 횟수: {stats.submitCount}회</Text>
              <Text style={styles.statText}>연속 학습: {stats.streak}일</Text>
              <Text style={styles.statText}>등급: {stats.tier}</Text>
            </YStack>
          </YStack>
        )}

        {/* 활동 기록 (잔디) */}
        <YStack>
          <Text style={styles.sectionTitle}>활동 기록</Text>
          <Text style={styles.emptyText}>활동 기록이 없습니다</Text>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    ...globalStyles.heading3,
  },
  statText: {
    ...globalStyles.text,
  },
  emptyText: {
    ...globalStyles.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

