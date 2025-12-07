import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { YStack } from 'tamagui';
import { colors, spacing } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 에러 바운더리 컴포넌트
 * React 컴포넌트 트리에서 발생한 에러를 캐치하여 UI에 표시
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <YStack alignItems="center" padding={spacing.xl}>
            <Text style={styles.title}>오류가 발생했습니다</Text>
            <Text style={styles.message}>
              {this.state.error?.message || '알 수 없는 오류가 발생했습니다.'}
            </Text>
            <Button
              title="다시 시도"
              onPress={this.handleReset}
              variant="primary"
              style={{ marginTop: spacing.lg }}
            />
          </YStack>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...globalStyles.heading2,
    marginBottom: spacing.md,
  },
  message: {
    ...globalStyles.textSecondary,
    textAlign: 'center',
  },
});

