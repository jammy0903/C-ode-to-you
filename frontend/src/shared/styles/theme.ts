/**
 * Theme Constants
 * Orbit 폰트를 사용한 코딩 학습 앱 전용 테마
 */

import { Platform } from 'react-native';

// 색상 팔레트 (코딩 앱에 적합한 다크 테마 중심)
export const colors = {
  // Primary (코딩/학습 액션)
  primary: '#4CAF50', // 성공/정답 색상
  primaryDark: '#388E3C',
  primaryLight: '#81C784',
  
  // Secondary (AI/힌트)
  secondary: '#2196F3', // AI 힌트 색상
  secondaryDark: '#1976D2',
  secondaryLight: '#64B5F6',
  
  // Accent (경고/주의)
  accent: '#FF9800', // 시도 중/주의
  accentDark: '#F57C00',
  accentLight: '#FFB74D',
  
  // Error (오답/에러)
  error: '#F44336', // 오답/컴파일 에러
  errorDark: '#D32F2F',
  errorLight: '#E57373',
  
  // Success (정답)
  success: '#4CAF50',
  successDark: '#388E3C',
  successLight: '#81C784',
  
  // Background
  background: '#0a0a0a',
  backgroundSecondary: '#1a1a1a',
  backgroundTertiary: '#2a2a2a',
  
  // Surface (카드/컨테이너)
  surface: '#1a1a1a',
  surfaceHover: '#2a2a2a',
  surfacePress: '#3a3a3a',
  
  // Text
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  textTertiary: '#666666',
  
  // Border
  border: '#2a2a2a',
  borderHover: '#3a3a3a',
  
  // Code Editor (사이버펑크 테마)
  codeBackground: '#0d1117',
  codeText: '#c9d1d9',
  codeKeyword: '#00ffff', // 네온 블루
  codeString: '#00ff00', // 네온 그린
  codeComment: '#6e7681',
  codeNumber: '#ffff00', // 네온 옐로우
  codeFunction: '#ff00ff', // 네온 마젠타
  
  // 미래지향적 네온 색상
  neonCyan: '#00ffff',
  neonGreen: '#00ff00',
  neonMagenta: '#ff00ff',
  neonYellow: '#ffff00',
  neonBlue: '#0080ff',
  
  // Baekjoon Tier Colors
  tierBronze: '#AD5600',
  tierSilver: '#435F7A',
  tierGold: '#EC9A00',
  tierPlatinum: '#27E2A4',
  tierDiamond: '#00B4FC',
  tierRuby: '#FF0062',
} as const;

// 간격 (Spacing)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// 폰트 크기 (Orbit 폰트 기준)
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  // 코드 에디터용
  code: 14,
  codeLarge: 16,
} as const;

// 폰트 두께
export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// Border Radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Shadow (Elevation)
// React Native Web: Use boxShadow instead of deprecated shadow* props
const hexToRgba = (hex: string, opacity: number): string => {
  if (hex === '#000') {
    return `rgba(0, 0, 0, ${opacity})`;
  }
  if (hex.startsWith('#')) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return hex;
};

export const createShadow = (
  offsetX: number,
  offsetY: number,
  blurRadius: number,
  spreadRadius: number,
  color: string,
  opacity: number
) => {
  const rgbaColor = hexToRgba(color, opacity);

  if (Platform.OS === 'web') {
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${blurRadius}px ${spreadRadius}px ${rgbaColor}`,
      elevation: offsetY > 0 ? Math.max(offsetY, blurRadius / 2) : 0,
    };
  }
  
  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blurRadius,
    elevation: offsetY > 0 ? Math.max(offsetY, blurRadius / 2) : 0,
  };
};

export const shadows = {
  sm: createShadow(0, 1, 2, 0, '#000', 0.1),
  md: createShadow(0, 2, 4, 0, '#000', 0.15),
  lg: createShadow(0, 4, 8, 0, '#000', 0.2),
} as const;

// Text Shadow utility
export const createTextShadow = (
  offsetX: number,
  offsetY: number,
  blurRadius: number,
  color: string,
  opacity: number = 1
) => {
  const rgbaColor = hexToRgba(color, opacity);

  if (Platform.OS === 'web') {
    return {
      textShadow: `${offsetX}px ${offsetY}px ${blurRadius}px ${rgbaColor}`,
    };
  }
  
  return {
    textShadowColor: color,
    textShadowOffset: { width: offsetX, height: offsetY },
    textShadowRadius: blurRadius,
  };
};

// Animation Durations
export const animation = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

// Z-Index Layers
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

