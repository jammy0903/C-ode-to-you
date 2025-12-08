/**
 * @file useGoogleAuth.ts
 * @description Google OAuth authentication hook using @react-native-google-signin/google-signin
 *
 * @principles
 * - SRP: Single responsibility - Google OAuth flow only
 * - Composition: Uses native Google Sign-In SDK
 *
 * @returns
 * - signInWithGoogle: () => Promise<GoogleAuthResult> - Initiate Google sign in
 * - isLoading: boolean - Loading state during OAuth flow
 * - error: string | null - Error message if OAuth fails
 * - isReady: boolean - SDK initialization status
 */

import { useEffect, useState } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { OAUTH_CONFIG } from '../../../shared/constants/config';

export interface GoogleAuthResult {
  idToken: string | null;
  accessToken: string | null;
  user: {
    email: string;
    name: string;
    picture: string;
  } | null;
}

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Configure Google Sign-In on mount
  useEffect(() => {
    const configureGoogleSignIn = async () => {
      try {
        GoogleSignin.configure({
          webClientId: OAUTH_CONFIG.GOOGLE.WEB_CLIENT_ID,
          offlineAccess: true, // To get idToken
          scopes: ['profile', 'email'],
        });
        setIsReady(true);
        console.log('[GoogleAuth] SDK configured successfully');
      } catch (err) {
        console.error('[GoogleAuth] Configuration error:', err);
        setError('Failed to initialize Google Sign-In');
      }
    };

    configureGoogleSignIn();
  }, []);

  /**
   * Initiate Google sign in flow
   * @returns GoogleAuthResult with tokens and user info
   */
  const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if device supports Google Play Services (Android)
      await GoogleSignin.hasPlayServices();

      // Sign in and get user info
      const userInfo = await GoogleSignin.signIn();

      // Get tokens
      const tokens = await GoogleSignin.getTokens();

      console.log('[GoogleAuth] Sign in successful:', {
        email: userInfo.data?.user.email,
        hasIdToken: !!tokens.idToken,
        hasAccessToken: !!tokens.accessToken,
      });

      return {
        idToken: tokens.idToken,
        accessToken: tokens.accessToken,
        user: userInfo.data?.user
          ? {
              email: userInfo.data.user.email,
              name: userInfo.data.user.name || userInfo.data.user.email,
              picture: userInfo.data.user.photo || '',
            }
          : null,
      };
    } catch (err: any) {
      let errorMessage = 'Google sign in failed';

      // 상세 에러 로깅
      console.error('[GoogleAuth] === ERROR DETAILS ===');
      console.error('[GoogleAuth] Error code:', err.code);
      console.error('[GoogleAuth] Error message:', err.message);
      console.error('[GoogleAuth] Full error:', JSON.stringify(err, null, 2));

      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Google sign in was cancelled';
      } else if (err.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Sign in is already in progress';
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Google Play Services not available';
      } else if (err.code === statusCodes.DEVELOPER_ERROR || err.code === 10) {
        errorMessage = 'DEVELOPER_ERROR (10): SHA-1 또는 Client ID 설정 오류';
      } else {
        // 에러 코드를 화면에 직접 표시
        errorMessage = `에러 코드: ${err.code}, 메시지: ${err.message || 'unknown'}`;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out from Google
   */
  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      console.log('[GoogleAuth] Sign out successful');
    } catch (err) {
      console.error('[GoogleAuth] Sign out error:', err);
    }
  };

  return {
    signInWithGoogle,
    signOut,
    isLoading,
    error,
    isReady,
  };
}
