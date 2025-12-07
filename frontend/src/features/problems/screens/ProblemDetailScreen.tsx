import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';
import { Loading } from '../../../shared/components/Loading';
import { FloatingChatButton } from '../../ai-chat/components/FloatingChatButton';
import { useProblemDetail } from '../hooks/useProblemDetail';
import { colors, spacing, borderRadius, createShadow, createTextShadow } from '../../../shared/styles/theme';
import { globalStyles } from '../../../shared/styles/globalStyles';

interface ProblemDetailScreenProps {
  route: {
    params: {
      problemId: string;
    };
  };
  navigation: any;
}

/**
 * 문제 상세 화면
 * 문제 설명, 입력/출력 형식, 예제, 추천 함수 표시
 */
export const ProblemDetailScreen: React.FC<ProblemDetailScreenProps> = ({ route, navigation }) => {
  const { problemId } = route.params;
  const { problem, isLoading, error } = useProblemDetail(problemId);
  const [showChatButton, setShowChatButton] = useState(true);

  const handleChatPress = () => {
    navigation.navigate('AIChat', { problemId });
  };

  const handleStartCoding = () => {
    navigation.navigate('CodeEditor', { problemId });
  };

  if (isLoading) {
    return <Loading fullScreen message="문제를 불러오는 중..." />;
  }

  if (error || !problem) {
    return (
      <ScreenContainer>
        <Text style={styles.errorText}>{error || '문제를 찾을 수 없습니다'}</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap={spacing.lg}>
          {/* 헤더 */}
          <YStack>
            <XStack alignItems="center" gap={spacing.sm} marginBottom={spacing.sm}>
              <Text style={styles.problemNumber}>#{problem.number}</Text>
              <Text style={styles.difficulty}>{problem.difficulty}</Text>
            </XStack>
            <Text style={styles.title}>{problem.title}</Text>
          </YStack>

          {/* 문제 설명 */}
          {problem.description && (
            <YStack>
              <Text style={styles.sectionTitle}>문제</Text>
              <Text style={styles.content}>{problem.description}</Text>
            </YStack>
          )}

          {/* 입력 형식 */}
          {problem.inputFormat && (
            <YStack>
              <Text style={styles.sectionTitle}>입력</Text>
              <Text style={styles.content}>{problem.inputFormat}</Text>
            </YStack>
          )}

          {/* 출력 형식 */}
          {problem.outputFormat && (
            <YStack>
              <Text style={styles.sectionTitle}>출력</Text>
              <Text style={styles.content}>{problem.outputFormat}</Text>
            </YStack>
          )}

          {/* 예제 */}
          {problem.examples && problem.examples.length > 0 && (
            <YStack>
              <Text style={styles.sectionTitle}>예제</Text>
              {problem.examples.map((example, index) => (
                <YStack key={index} marginTop={spacing.md}>
                  <Text style={styles.exampleLabel}>예제 {index + 1}</Text>
                  <YStack backgroundColor={colors.surface} padding={spacing.md} borderRadius={8}>
                    <Text style={styles.exampleText}>입력:</Text>
                    <Text style={styles.codeText}>{example.input}</Text>
                    <Text style={styles.exampleText}>출력:</Text>
                    <Text style={styles.codeText}>{example.output}</Text>
                  </YStack>
                </YStack>
              ))}
            </YStack>
          )}

          {/* 제한 사항 */}
          {(problem.timeLimit || problem.memoryLimit) && (
            <YStack>
              <Text style={styles.sectionTitle}>제한</Text>
              <XStack gap={spacing.md}>
                {problem.timeLimit && (
                  <Text style={styles.limitText}>시간: {problem.timeLimit}ms</Text>
                )}
                {problem.memoryLimit && (
                  <Text style={styles.limitText}>메모리: {problem.memoryLimit}MB</Text>
                )}
              </XStack>
            </YStack>
          )}

          {/* 코딩 시작 버튼 */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartCoding}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>⚡ 코딩 시작하기</Text>
          </TouchableOpacity>
        </YStack>
      </ScrollView>

      {/* 플로팅 AI 채팅 버튼 */}
      <FloatingChatButton onPress={handleChatPress} visible={showChatButton} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  problemNumber: {
    ...globalStyles.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  difficulty: {
    ...globalStyles.textSecondary,
    fontSize: 14,
  },
  title: {
    ...globalStyles.heading2,
  },
  sectionTitle: {
    ...globalStyles.heading3,
    marginBottom: spacing.sm,
  },
  content: {
    ...globalStyles.text,
    lineHeight: 24,
  },
  exampleLabel: {
    ...globalStyles.textSecondary,
    marginBottom: spacing.xs,
  },
  exampleText: {
    ...globalStyles.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  codeText: {
    ...globalStyles.codeText,
    marginTop: spacing.xs,
  },
  limitText: {
    ...globalStyles.textSecondary,
  },
  errorText: {
    ...globalStyles.errorText,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: '#00ffff',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    ...createShadow(0, 0, 15, 0, '#00ffff', 0.8),
  },
  startButtonText: {
    ...globalStyles.heading3,
    color: '#00ffff',
    ...createTextShadow(0, 0, 10, '#00ffff'),
  },
});

