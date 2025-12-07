import React from 'react';
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
 * 
 * @description
 * Kakao, Google OAuth 로그인을 지원하는 인증 화면입니다.
 * 
 * @features
 * - Kakao OAuth 로그인 (현재 mock 코드 사용, 실제 SDK 연동 필요)
 * - Google OAuth 로그인 (expo-auth-session 사용)
 * - 로그인 상태 관리 (useAuth, useGoogleAuth 훅 활용)
 * - 에러 처리 및 로딩 상태 표시
 * 
 * @architecture
 * - useAuth: 백엔드 인증 처리 및 세션 관리
 * - useGoogleAuth: Google OAuth 플로우 처리
 * - 상태 관리: 훅에서 제공하는 상태를 직접 활용 (중복 상태 제거)
 * 
 * @note
 * - 로그인 진행 중에는 전체 화면 로딩 표시
 * - Google 로그인 취소 시 에러 메시지 표시하지 않음
 * - 에러는 각 훅의 error 상태로 관리됨
 */
export const LoginScreen: React.FC = () => {
  const { loginWithKakao, loginWithGoogle, isLoggingIn, error: authError } = useAuth();
  const { signInWithGoogle, isLoading: isGoogleOAuthLoading, error: googleOAuthError, isReady: isGoogleReady } = useGoogleAuth();

  const handleKakaoLogin = async () => {
    try {
      // TODO: 실제 Kakao OAuth SDK 연동
      // 임시로 테스트용 코드 전달
      const mockCode = 'mock_kakao_code';
      await loginWithKakao(mockCode);
    } catch (err) {
      console.error('Kakao login error:', err);
      // 에러는 useAuth의 error로 처리됨
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // 1. Google OAuth로 idToken 획득
      const result = await signInWithGoogle();

      console.log('[LoginScreen] Google OAuth result:', {
        hasIdToken: !!result.idToken,
        user: result.user,
      });

      if (!result.idToken) {
        throw new Error('No idToken received from Google');
      }

      // 2. 백엔드로 idToken만 전송 (보안 권장 방식)
      console.log('[LoginScreen] Sending idToken to backend...');
      await loginWithGoogle(result.idToken);
    } catch (err: any) {
      console.error('[LoginScreen] Google login error:', err.message || err);
    }
  };

  // 로그인 진행 중일 때만 전체 화면 로딩 표시
  if (isLoggingIn) {
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
                loading={isLoggingIn}
                disabled={isLoggingIn}
                fullWidth
                style={styles.kakaoButton}
              />

              {/* Google 로그인 버튼 */}
              <Button
                title="Google로 시작하기"
                onPress={handleGoogleLogin}
                variant="outline"
                size="large"
                loading={isGoogleOAuthLoading || isLoggingIn}
                disabled={!isGoogleReady || isLoggingIn}
                fullWidth
              />
            </YStack>

            {/* 에러 메시지 */}
            {authError && (
              <Text style={styles.errorText}>{authError}</Text>
            )}
            {googleOAuthError && googleOAuthError !== 'Google sign in was cancelled' && (
              <Text style={styles.errorText}>{googleOAuthError}</Text>
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

