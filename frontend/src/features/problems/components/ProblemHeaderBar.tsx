import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { XStack } from 'tamagui';
import { Problem } from '../../../shared/types/api.types';
import { getTierColor, formatDifficulty } from '../utils/problemUtils';
import { colors, spacing, borderRadius, createTextShadow } from '../../../shared/styles/theme';

interface ProblemHeaderBarProps {
  problem: Problem | null;
  onPress?: () => void;
  isLoading?: boolean;
}

/**
 * 코드 에디터 상단에 고정되는 축소된 문제 정보 바
 * 탭하면 문제 상세 화면으로 이동
 */
export const ProblemHeaderBar: React.FC<ProblemHeaderBarProps> = ({
  problem,
  onPress,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>문제 로딩 중...</Text>
      </View>
    );
  }

  if (!problem) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>문제를 불러올 수 없습니다</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <XStack alignItems="center" gap={spacing.sm} flex={1}>
        {/* 문제 번호 */}
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>#{problem.number}</Text>
        </View>

        {/* 난이도 뱃지 */}
        <View style={[styles.tierBadge, { backgroundColor: getTierColor(problem.difficulty) }]}>
          <Text style={styles.tierText}>{formatDifficulty(problem.difficulty)}</Text>
        </View>

        {/* 문제 제목 */}
        <Text style={styles.title} numberOfLines={1}>{problem.title}</Text>
      </XStack>

      {/* 상세보기 아이콘 */}
      <Text style={styles.expandIcon}>▼</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 255, 0.2)',
    minHeight: 44,
  },
  loadingText: {
    color: '#6e7681',
    fontSize: 12,
    fontFamily: 'Orbitron-Regular',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    fontFamily: 'Orbitron-Regular',
  },
  numberBadge: {
    backgroundColor: 'rgba(0, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  numberText: {
    color: '#00ffff',
    fontSize: 11,
    fontFamily: 'Orbitron-SemiBold',
    ...createTextShadow(0, 0, 3, '#00ffff', 0.5),
  },
  tierBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tierText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'Orbitron-SemiBold',
  },
  title: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'Orbitron-Regular',
    ...createTextShadow(0, 0, 2, '#00ffff', 0.3),
  },
  expandIcon: {
    color: 'rgba(0, 255, 255, 0.6)',
    fontSize: 10,
    marginLeft: spacing.sm,
  },
});
