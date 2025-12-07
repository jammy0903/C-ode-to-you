import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { colors, spacing, borderRadius, createShadow } from '../../../shared/styles/theme';
import { globalStyles } from '../../../shared/styles/globalStyles';

interface TestCaseResultProps {
  caseNumber: number;
  status: 'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error';
  input: string;
  output: string;
  expected?: string;
}

/**
 * 테스트 케이스 결과 컴포넌트 (미래지향적 디자인)
 */
export const TestCaseResult: React.FC<TestCaseResultProps> = ({
  caseNumber,
  status,
  input,
  output,
  expected,
}) => {
  const isAccepted = status === 'accepted';
  const statusColor = isAccepted ? '#00ff00' : '#ff0000';

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: statusColor,
          backgroundColor: isAccepted
            ? 'rgba(0, 255, 0, 0.05)'
            : 'rgba(255, 0, 0, 0.05)',
        },
        createShadow(0, 0, 8, 0, statusColor, 0.3),
      ]}
    >
      <XStack justifyContent="space-between" alignItems="center" marginBottom={spacing.sm}>
        <Text style={styles.caseNumber}>테스트 케이스 #{caseNumber}</Text>
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: statusColor,
            },
            createShadow(0, 0, 8, 0, statusColor, 1),
          ]}
        />
      </XStack>

      <YStack gap={spacing.xs}>
        <YStack>
          <Text style={styles.label}>입력</Text>
          <Text style={styles.codeText}>{input}</Text>
        </YStack>

        <YStack>
          <Text style={styles.label}>출력</Text>
          <Text style={[styles.codeText, { color: statusColor }]}>{output}</Text>
        </YStack>

        {expected && !isAccepted && (
          <YStack>
            <Text style={styles.label}>예상 출력</Text>
            <Text style={styles.codeText}>{expected}</Text>
          </YStack>
        )}
      </YStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  caseNumber: {
    ...globalStyles.textSecondary,
    fontSize: 12,
    fontFamily: 'Orbitron-SemiBold',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    ...globalStyles.textTertiary,
    fontSize: 10,
    marginBottom: spacing.xs,
  },
  codeText: {
    ...globalStyles.codeText,
    fontSize: 12,
    padding: spacing.xs,
  },
});

