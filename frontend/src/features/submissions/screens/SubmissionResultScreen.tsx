import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';
import { Loading } from '../../../shared/components/Loading';
import { VerdictBadge } from '../components/VerdictBadge';
import { TestCaseResult } from '../components/TestCaseResult';
import { useSubmission } from '../hooks/useSubmission';
import { colors, spacing, borderRadius, createShadow, createTextShadow } from '../../../shared/styles/theme';
import { globalStyles } from '../../../shared/styles/globalStyles';

interface SubmissionResultScreenProps {
  route: {
    params: {
      submissionId: string;
      problemId: string;
    };
  };
  navigation?: any;
}

/**
 * 미래지향적인 제출 결과 화면
 * 네온 효과, 홀로그램 스타일
 */
export const SubmissionResultScreen: React.FC<SubmissionResultScreenProps> = ({ route, navigation }) => {
  const { submissionId, problemId } = route.params;
  // Polling is handled automatically by the useSubmission hook
  const { currentSubmission, isSubmitting } = useSubmission(problemId);
  const glowAnimation = useRef(new Animated.Value(0)).current;

  // 네온 글로우 애니메이션
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnimation]);

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  if (!currentSubmission) {
    return <Loading fullScreen message="제출 결과를 불러오는 중..." />;
  }

  const isJudging = currentSubmission.status === 'pending' || currentSubmission.status === 'judging';
  const isAccepted = currentSubmission.status === 'accepted';

  return (
    <ScreenContainer safeArea padding={false} style={styles.container}>
      {/* 네온 헤더 */}
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: isJudging ? glowOpacity : 1,
            },
          ]}
        />
        <YStack alignItems="center" padding={spacing.xl}>
          <Text style={styles.title}>제출 결과</Text>
          <VerdictBadge status={currentSubmission.status} />
        </YStack>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 채점 중일 때 */}
        {isJudging && (
          <YStack alignItems="center" padding={spacing.xl}>
            <Animated.View style={{ opacity: glowOpacity }}>
              <Text style={styles.judgingText}>채점 중...</Text>
            </Animated.View>
            <Text style={styles.judgingSubtext}>잠시만 기다려주세요</Text>
          </YStack>
        )}

        {/* 결과가 나왔을 때 */}
        {!isJudging && (
          <YStack gap={spacing.lg} padding={spacing.md}>
            {/* 실행 정보 */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>실행 정보</Text>
              <XStack justifyContent="space-between" marginTop={spacing.md}>
                <YStack>
                  <Text style={styles.infoLabel}>실행 시간</Text>
                  <Text style={styles.infoValue}>
                    {currentSubmission.executionTime || 0}ms
                  </Text>
                </YStack>
                <YStack>
                  <Text style={styles.infoLabel}>메모리 사용</Text>
                  <Text style={styles.infoValue}>
                    {currentSubmission.memoryUsage || 0}MB
                  </Text>
                </YStack>
              </XStack>
            </View>

            {/* 테스트 케이스 결과 */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>테스트 케이스</Text>
              <YStack gap={spacing.sm} marginTop={spacing.md}>
                {/* TODO: 실제 테스트 케이스 데이터로 교체 */}
                <TestCaseResult
                  caseNumber={1}
                  status="accepted"
                  input="1 2"
                  output="3"
                  expected="3"
                />
                <TestCaseResult
                  caseNumber={2}
                  status="accepted"
                  input="5 10"
                  output="15"
                  expected="15"
                />
              </YStack>
            </View>

            {/* 에러 메시지 (있는 경우) */}
            {currentSubmission.verdict && !isAccepted && (
              <View style={[styles.infoCard, styles.errorCard]}>
                <Text style={styles.sectionTitle}>에러 메시지</Text>
                <Text style={styles.errorText}>{currentSubmission.verdict}</Text>
              </View>
            )}
          </YStack>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a0f',
  },
  header: {
    backgroundColor: '#0d1117',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
    position: 'relative',
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  title: {
    ...globalStyles.heading1,
    color: '#00ffff',
    ...createTextShadow(0, 0, 10, '#00ffff'),
    marginBottom: spacing.md,
  },
  content: {
    flex: 1,
  },
  judgingText: {
    ...globalStyles.heading2,
    color: '#00ffff',
    ...createTextShadow(0, 0, 10, '#00ffff'),
  },
  judgingSubtext: {
    ...globalStyles.textSecondary,
    marginTop: spacing.sm,
  },
  infoCard: {
    backgroundColor: '#0d1117',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#1a1a2e',
    ...createShadow(0, 0, 10, 0, '#00ffff', 0.2),
  },
  errorCard: {
    borderColor: '#ff0000',
    ...createShadow(0, 0, 10, 0, '#ff0000', 0.2),
  },
  sectionTitle: {
    ...globalStyles.heading3,
    color: '#00ffff',
    ...createTextShadow(0, 0, 5, '#00ffff'),
  },
  infoLabel: {
    ...globalStyles.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...globalStyles.text,
    fontSize: 18,
    fontFamily: 'Orbitron-Bold',
    color: '#00ffff',
  },
  errorText: {
    ...globalStyles.text,
    color: '#ff6b6b',
    marginTop: spacing.md,
    fontFamily: 'Orbitron-Regular',
  },
});

