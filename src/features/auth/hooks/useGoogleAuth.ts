/**
 * @file useGoogleAuth.ts
 * @description Google OAuth authentication hook using expo-auth-session
 *
 * @principles
 * - SRP: Single responsibility - Google OAuth flow only
 * - Composition: Uses expo-auth-session + AuthService
 *
 * @returns
 * - signInWithGoogle: () => Promise<void> - Initiate Google sign in
 * - isLoading: boolean - Loading state during OAuth flow
 * - error: string | null - Error message if OAuth fails
 */

import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { OAUTH_CONFIG } from '../../../shared/constants/config';

// Required for expo-auth-session to work properly
WebBrowser.maybeCompleteAuthSession();

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

  // Expo Go에서는 auth.expo.io 프록시 사용 (HTTPS 필요)
  const redirectUri = 'https://auth.expo.io/@fuso93/code2u';

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      webClientId: OAUTH_CONFIG.GOOGLE.WEB_CLIENT_ID,
      androidClientId: OAUTH_CONFIG.GOOGLE.WEB_CLIENT_ID,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
    },
    {
      useProxy: true, // COOP 문제 해결을 위해 Expo 프록시 사용
    }
  );

  // Handle OAuth errors
  useEffect(() => {
    if (response?.type === 'error') {
      setError(response.error?.message || 'Google sign in failed');
      console.error('[GoogleAuth] Error:', response.error);
    }
  }, [response]);

  /**
   * Initiate Google sign in flow
   * @returns GoogleAuthResult with tokens and user info
   */
  const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await promptAsync();

      if (result.type === 'success' && result.authentication) {
        const { accessToken, idToken } = result.authentication;

        // Fetch user info from Google
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/userinfo/v2/me',
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch user info from Google');
        }

        const userInfo = await userInfoResponse.json();

        return {
          idToken: idToken || null,
          accessToken: accessToken || null,
          user: {
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
          },
        };
      } else if (result.type === 'cancel') {
        throw new Error('Google sign in was cancelled');
      } else {
        throw new Error('Google sign in failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithGoogle,
    isLoading,
    error,
    isReady: !!request, // OAuth request is ready
  };
}
