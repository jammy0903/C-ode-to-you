import React, { useState } from 'react';
import { Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { YStack } from 'tamagui';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';
import { Button } from '../../../shared/components/Button';
import { Loading } from '../../../shared/components/Loading';
import { useAuth } from '../hooks/useAuth';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { spacing, fontSize } from '../../../shared/styles/theme';
import { globalStyles } from '../../../shared/styles/globalStyles';

/**
 * 로그인 화면
 * Kakao, Google OAuth 로그인 지원
 */
export const LoginScreen: React.FC = () => {
  const { loginWithKakao, loginWithGoogle, isLoading, error } = useAuth();
  const { signInWithGoogle, isLoading: isGoogleOAuthLoading, isReady: isGoogleReady } = useGoogleAuth();
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleKakaoLogin = async () => {
    setIsKakaoLoading(true);
    setLocalError(null);
    try {
      // TODO: 실제 Kakao OAuth SDK 연동
      // 임시로 테스트용 코드 전달
      const mockCode = 'mock_kakao_code';
      await loginWithKakao(mockCode);
    } catch (err) {
      console.error('Kakao login error:', err);
      setLocalError('카카오 로그인에 실패했습니다.');
    } finally {
      setIsKakaoLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setLocalError(null);

    // TODO: Expo Go에서는 COOP 제한으로 OAuth 불가
    // 개발 빌드 또는 프로덕션 빌드에서 테스트 필요
    setLocalError('Expo Go에서는 Google 로그인이 지원되지 않습니다.\n개발 빌드(EAS Build)를 사용해주세요.');
    setIsGoogleLoading(false);

    // 원래 코드 (개발 빌드에서 사용)
    /*
    try {
      const result = await signInWithGoogle();

      if (result.accessToken && result.user) {
        await loginWithGoogle(result.accessToken);
      } else {
        throw new Error('No access token or user info received');
      }
    } catch (err) {
      console.error('Google login error:', err);
      if (err instanceof Error && err.message !== 'Google sign in was cancelled') {
        setLocalError('Google 로그인에 실패했습니다.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
    */
  };

  if (isLoading) {
    return <Loading fullScreen message="로그인 중..." />;
  }

  return (
    <ScreenContainer safeArea padding={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <YStack alignItems="center" justifyContent="center" flex={1} padding={spacing.xl}>
            {/* 앱 로고/타이틀 */}
            <Text style={styles.title}>C-ode to you</Text>
            <Text style={styles.subtitle}>백준 문제로 배우는 C 언어</Text>

            <YStack width="100%" marginTop={spacing.xxl} gap={spacing.md}>
              {/* Kakao 로그인 버튼 */}
              <Button
                title="카카오로 시작하기"
                onPress={handleKakaoLogin}
                variant="primary"
                size="large"
                loading={isKakaoLoading}
                fullWidth
                style={styles.kakaoButton}
              />

              {/* Google 로그인 버튼 */}
              <Button
                title="Google로 시작하기"
                onPress={handleGoogleLogin}
                variant="outline"
                size="large"
                loading={isGoogleLoading || isGoogleOAuthLoading}
                disabled={!isGoogleReady}
                fullWidth
              />
            </YStack>

            {/* 에러 메시지 */}
            {(error || localError) && (
              <Text style={styles.errorText}>{error || localError}</Text>
            )}

            {/* 약관/개인정보 처리방침 링크 (선택) */}
            <Text style={styles.footerText}>
              로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
            </Text>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    ...globalStyles.heading1,
    fontSize: fontSize['4xl'],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...globalStyles.textSecondary,
    fontSize: fontSize.lg,
    textAlign: 'center',
  },
  kakaoButton: {
    backgroundColor: '#FEE500', // Kakao 브랜드 색상
  },
  errorText: {
    ...globalStyles.errorText,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  footerText: {
    ...globalStyles.textTertiary,
    fontSize: fontSize.xs,
    marginTop: spacing.xl,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});

