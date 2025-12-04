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
  // Google Fonts Orbitron의 공식 이름으로 매핑
  const [fontsLoaded, fontError] = useFonts({
    'Orbitron-Regular': Orbitron_400Regular,
    'Orbitron-Medium': Orbitron_500Medium,
    'Orbitron-SemiBold': Orbitron_600SemiBold,
    'Orbitron-Bold': Orbitron_700Bold,
    'Orbitron-Black': Orbitron_900Black,
    // 기본 Orbitron 이름도 Regular로 매핑 (웹 호환성)
    'Orbitron': Orbitron_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // 에러가 발생하면 콘솔에 출력
  useEffect(() => {
    if (fontError) {
      console.error('Font loading error:', fontError);
    }
  }, [fontError]);

  return { fontsLoaded: fontsLoaded || false, fontError };
};

