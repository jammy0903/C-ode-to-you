import { createTamagui } from 'tamagui';
import { config } from '@tamagui/config/v3';

// Orbit 폰트를 위한 커스텀 설정
const tamaguiConfig = createTamagui({
  ...config,
  fonts: {
    ...config.fonts,
    // Orbitron 폰트를 메인 폰트로 설정
    body: {
      family: 'Orbitron-Regular',
      size: {
        1: 12,
        2: 14,
        3: 16,
        4: 18,
        5: 20,
        6: 24,
        7: 28,
        8: 32,
        9: 36,
        10: 40,
      },
      lineHeight: {
        1: 16,
        2: 20,
        3: 24,
        4: 28,
        5: 32,
        6: 36,
        7: 40,
        8: 44,
        9: 48,
        10: 52,
      },
      weight: {
        1: '400',
        2: '500',
        3: '600',
        4: '700',
      },
      letterSpacing: {
        1: 0,
        2: 0.5,
        3: 1,
        4: 1.5,
      },
    },
    // 코드 에디터용 모노스페이스 폰트 (Orbitron 기반)
    mono: {
      family: 'Orbitron-Regular',
      size: {
        1: 12,
        2: 14,
        3: 16,
        4: 18,
        5: 20,
      },
      lineHeight: {
        1: 18,
        2: 20,
        3: 24,
        4: 28,
        5: 32,
      },
      weight: {
        1: '400',
        2: '500',
      },
      letterSpacing: {
        1: 0,
        2: 0.5,
      },
    },
  },
  themes: {
    ...config.themes,
    // 다크 테마 (코딩 앱에 적합)
    dark: {
      ...config.themes.dark,
      background: '#0a0a0a',
      backgroundHover: '#1a1a1a',
      backgroundPress: '#2a2a2a',
      backgroundFocus: '#1a1a1a',
      color: '#ffffff',
      colorHover: '#e0e0e0',
      colorPress: '#ffffff',
      colorFocus: '#ffffff',
      borderColor: '#2a2a2a',
      borderColorHover: '#3a3a3a',
      placeholderColor: '#666666',
    },
    // 라이트 테마
    light: {
      ...config.themes.light,
      background: '#ffffff',
      backgroundHover: '#f5f5f5',
      backgroundPress: '#e0e0e0',
      backgroundFocus: '#f5f5f5',
      color: '#0a0a0a',
      colorHover: '#1a1a1a',
      colorPress: '#0a0a0a',
      colorFocus: '#0a0a0a',
      borderColor: '#e0e0e0',
      borderColorHover: '#d0d0d0',
      placeholderColor: '#999999',
    },
  },
});

export default tamaguiConfig;

// TypeScript 타입 추론을 위한 export
export type Conf = typeof tamaguiConfig;
declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

