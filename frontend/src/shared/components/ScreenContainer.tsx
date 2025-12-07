import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';
import { colors, spacing } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  safeArea?: boolean;
  padding?: boolean;
}

/**
 * 모든 화면의 기본 래퍼 컴포넌트
 * SafeArea, 패딩, 배경색 등을 자동으로 처리
 */
export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  safeArea = true,
  padding = true,
}) => {
  const containerStyle = [
    globalStyles.container,
    padding && { paddingHorizontal: spacing.md },
    style,
  ];

  if (safeArea) {
    return (
      <SafeAreaView style={containerStyle} edges={['top', 'bottom']}>
        {children}
      </SafeAreaView>
    );
  }

  return <YStack style={containerStyle}>{children}</YStack>;
};

