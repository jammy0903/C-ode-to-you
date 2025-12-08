/**
 * @file App.tsx
 * @description Root application component - sets up providers and navigation
 *
 * @principles
 * - SRP: ✅ Single responsibility: app initialization and provider setup
 * - Composition: ✅ Composes multiple providers in correct order
 * - Error Handling: ✅ Gracefully handles font loading errors without blocking app
 *
 * @components
 * - App(): React.FC - Root component that initializes app providers and navigation
 *
 * @providers (order matters)
 * - GestureHandlerRootView: Gesture handler root (outermost)
 * - KeyboardProvider: Keyboard handling provider (react-native-keyboard-controller)
 * - SafeAreaProvider: Safe area context provider
 * - TamaguiProvider: UI component library provider
 * - QueryClientProvider: TanStack Query state management
 * - ThemeProvider: Theme management provider
 * - AuthProvider: Authentication context provider
 *
 * @notes
 * - Font loading is non-blocking - app renders even if fonts fail to load
 * - Web platform: fonts are optional, app works with system fonts as fallback
 * - QueryClientProvider must wrap AuthProvider (auth uses TanStack Query)
 */
import 'react-native-gesture-handler';
import { TamaguiProvider } from 'tamagui';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import tamaguiConfig from '../../tamagui.config';
import { queryClient } from '../shared/lib/queryClient';
import { useFontLoader } from '../shared/utils/fontLoader';
import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { RootNavigator } from './navigation/RootNavigator';

export default function App() {
  console.log('[App] Rendering...');

  // 테스트: 간단한 화면부터 렌더링
  const { fontsLoaded, fontError } = useFontLoader();
  console.log('[App] fontsLoaded:', fontsLoaded, 'fontError:', fontError);

  // 폰트 로딩 실패 시에도 앱을 표시 (폰트는 폴백으로 작동)
  if (fontError) {
    console.warn('Font loading error:', fontError);
  }

  // 폰트가 로드되지 않아도 앱을 표시 (웹에서는 폰트가 선택적)
  // if (!fontsLoaded && !fontError) {
  //   return null; // Splash screen이 표시됨
  // }

  return (
    <GestureHandlerRootView style={styles.container}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <TamaguiProvider config={tamaguiConfig}>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider>
                <AuthProvider>
                  <RootNavigator />
                  <StatusBar style="light" />
                </AuthProvider>
              </ThemeProvider>
            </QueryClientProvider>
          </TamaguiProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

