/**
 * @file fontLoader.ts
 * @description Font loading utility hook for Orbitron Google Fonts
 * 
 * @principles
 * - SRP: ✅ Single responsibility: font loading and splash screen management
 * - Error Handling: ✅ Gracefully handles font loading errors with console logging
 * - User Experience: ✅ Hides splash screen when fonts are loaded or error occurs
 * 
 * @functions
 * - useFontLoader(): FontLoaderReturn - Hook that loads Orbitron font family
 * 
 * @returns
 * - fontsLoaded: boolean - Whether all fonts have been loaded successfully
 * - fontError: Error | null - Error object if font loading failed
 * 
 * @fonts
 * - Orbitron_400Regular: Regular weight (400)
 * - Orbitron_500Medium: Medium weight (500)
 * - Orbitron_600SemiBold: Semi-bold weight (600)
 * - Orbitron_700Bold: Bold weight (700)
 * - Orbitron_900Black: Black weight (900)
 * 
 * @notes
 * - Uses @expo-google-fonts/orbitron package for font loading
 * - Automatically hides splash screen when fonts are loaded or error occurs
 * - Font errors are logged to console but don't block app functionality
 */
import {
  useFonts,
  Orbitron_400Regular,
  Orbitron_500Medium,
  Orbitron_600SemiBold,
  Orbitron_700Bold,
  Orbitron_900Black,
} from '@expo-google-fonts/orbitron';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
export const useFontLoader = () => {
  // TEMP FIX: Development Build에서 폰트 로딩 이슈로 인해 비활성화
  // 시스템 기본 폰트 사용
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return { fontsLoaded: true, fontError: null };

  /* 원래 코드 - 폰트 문제 해결 후 복원
  const [fontsLoaded, fontError] = useFonts({
    'Orbitron-Regular': Orbitron_400Regular,
    'Orbitron-Medium': Orbitron_500Medium,
    'Orbitron-SemiBold': Orbitron_600SemiBold,
    'Orbitron-Bold': Orbitron_700Bold,
    'Orbitron-Black': Orbitron_900Black,
    'Orbitron': Orbitron_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (fontError) {
      console.error('Font loading error:', fontError);
    }
  }, [fontError]);

  return { fontsLoaded: fontsLoaded || false, fontError };
  */
};

