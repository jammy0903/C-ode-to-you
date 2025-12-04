import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { colors, spacing, borderRadius, createShadow, createTextShadow } from '../../../shared/styles/theme';
import { globalStyles } from '../../../shared/styles/globalStyles';

interface VerdictBadgeProps {
  status: string;
}

/**
 * 채점 결과 뱃지 (미래지향적 디자인)
 */
export const VerdictBadge: React.FC<VerdictBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'accepted':
        return {
          text: 'AC',
          fullText: 'Accepted',
          color: '#00ff00',
          bgColor: 'rgba(0, 255, 0, 0.1)',
        };
      case 'wrong_answer':
        return {
          text: 'WA',
          fullText: 'Wrong Answer',
          color: '#ff0000',
          bgColor: 'rgba(255, 0, 0, 0.1)',
        };
      case 'compile_error':
        return {
          text: 'CE',
          fullText: 'Compile Error',
          color: '#ff8800',
          bgColor: 'rgba(255, 136, 0, 0.1)',
        };
      case 'runtime_error':
        return {
          text: 'RE',
          fullText: 'Runtime Error',
          color: '#ff00ff',
          bgColor: 'rgba(255, 0, 255, 0.1)',
        };
      case 'time_limit':
        return {
          text: 'TLE',
          fullText: 'Time Limit Exceeded',
          color: '#ffff00',
          bgColor: 'rgba(255, 255, 0, 0.1)',
        };
      case 'memory_limit':
        return {
          text: 'MLE',
          fullText: 'Memory Limit Exceeded',
          color: '#00ffff',
          bgColor: 'rgba(0, 255, 255, 0.1)',
        };
      case 'judging':
      case 'pending':
        return {
          text: '...',
          fullText: 'Judging',
          color: '#00ffff',
          bgColor: 'rgba(0, 255, 255, 0.1)',
        };
      default:
        return {
          text: '?',
          fullText: 'Unknown',
          color: '#888888',
          bgColor: 'rgba(136, 136, 136, 0.1)',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bgColor,
          borderColor: config.color,
        },
        createShadow(0, 0, 15, 0, config.color, 0.8),
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: config.color,
          },
          createTextShadow(0, 0, 10, config.color, 1),
        ]}
      >
        {config.text}
      </Text>
      <Text style={styles.badgeFullText}>{config.fullText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 32,
    fontFamily: 'Orbitron-Bold',
    marginBottom: spacing.xs,
  },
  badgeFullText: {
    ...globalStyles.textSecondary,
    fontSize: 12,
  },
});

