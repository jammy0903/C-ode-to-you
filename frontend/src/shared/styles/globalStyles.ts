import { StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from './theme';

/**
 * Global Styles
 * 앱 전역에서 사용하는 공통 스타일 유틸리티
 */

export const globalStyles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerSecondary: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  
  // Safe Area
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Screen Container (모든 화면의 기본 래퍼)
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  
  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  
  // Text Styles
  text: {
    color: colors.text,
    fontSize: fontSize.md,
    fontFamily: 'Orbitron-Regular',
  },
  textSecondary: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontFamily: 'Orbitron-Regular',
  },
  textTertiary: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    fontFamily: 'Orbitron-Regular',
  },
  heading1: {
    color: colors.text,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    fontFamily: 'Orbitron-Bold',
  },
  heading2: {
    color: colors.text,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    fontFamily: 'Orbitron-SemiBold',
  },
  heading3: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    fontFamily: 'Orbitron-SemiBold',
  },
  
  // Code Text (모노스페이스)
  codeText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: fontSize.code,
    color: colors.codeText,
    backgroundColor: colors.codeBackground,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  
  // Button Base
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    fontFamily: 'Orbitron-SemiBold',
  },
  
  // Input Base
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: fontSize.md,
    fontFamily: 'Orbitron-Regular',
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  
  // Loading Spinner
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Error Message
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    fontFamily: 'Orbitron-Regular',
    marginTop: spacing.xs,
  },
  
  // Flex Utilities
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Spacing Utilities
  mbXs: { marginBottom: spacing.xs },
  mbSm: { marginBottom: spacing.sm },
  mbMd: { marginBottom: spacing.md },
  mbLg: { marginBottom: spacing.lg },
  mbXl: { marginBottom: spacing.xl },
  
  mtXs: { marginTop: spacing.xs },
  mtSm: { marginTop: spacing.sm },
  mtMd: { marginTop: spacing.md },
  mtLg: { marginTop: spacing.lg },
  mtXl: { marginTop: spacing.xl },
  
  pXs: { padding: spacing.xs },
  pSm: { padding: spacing.sm },
  pMd: { padding: spacing.md },
  pLg: { padding: spacing.lg },
  pXl: { padding: spacing.xl },
});

