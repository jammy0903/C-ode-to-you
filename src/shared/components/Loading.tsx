import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { YStack } from 'tamagui';
import { colors, spacing } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * 로딩 스피너 컴포넌트
 * 전체 화면 또는 인라인으로 사용 가능
 */
export const Loading: React.FC<LoadingProps> = ({ message, fullScreen = false }) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    );
  }

  return (
    <YStack alignItems="center" justifyContent="center" padding={spacing.lg}>
      <ActivityIndicator size="small" color={colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </YStack>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    ...globalStyles.loadingContainer,
    backgroundColor: colors.background,
  },
  message: {
    ...globalStyles.textSecondary,
    marginTop: spacing.md,
  },
});

