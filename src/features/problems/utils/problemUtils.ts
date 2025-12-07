/**
 * @file problemUtils.ts
 * @description 문제 관련 공통 유틸리티 함수들
 *
 * @principles
 * - DRY: 여러 컴포넌트에서 재사용되는 로직 중앙화
 * - SRP: 문제 관련 헬퍼 함수만 담당
 */

import { colors } from '../../../shared/styles/theme';

/**
 * 난이도(티어)에 따른 색상 반환
 * @param difficulty - 'bronze_5', 'silver_3', 'gold_1' 등의 형식
 */
export const getTierColor = (difficulty: string): string => {
  if (difficulty.includes('bronze')) return colors.tierBronze;
  if (difficulty.includes('silver')) return colors.tierSilver;
  if (difficulty.includes('gold')) return colors.tierGold;
  if (difficulty.includes('platinum')) return colors.tierPlatinum;
  if (difficulty.includes('diamond')) return colors.tierDiamond;
  if (difficulty.includes('ruby')) return colors.tierRuby;
  return colors.textSecondary;
};

/**
 * 사용자 풀이 상태에 따른 색상 반환
 * @param status - 'solved', 'attempted', 'unsolved'
 */
export const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'solved':
      return colors.success;
    case 'attempted':
      return colors.accent;
    default:
      return colors.textTertiary;
  }
};

/**
 * 사용자 풀이 상태에 따른 아이콘 반환
 * @param status - 'solved', 'attempted', 'unsolved'
 */
export const getStatusIcon = (status?: string): string => {
  switch (status) {
    case 'solved':
      return '✓';
    case 'attempted':
      return '○';
    default:
      return '○';
  }
};

/**
 * 사용자 풀이 상태에 따른 한글 텍스트 반환
 * @param status - 'solved', 'attempted', 'unsolved'
 */
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'solved':
      return '해결';
    case 'attempted':
      return '시도';
    default:
      return '미해결';
  }
};

/**
 * 난이도 문자열 포맷팅
 * @param difficulty - 'silver_5' → 'Silver 5'
 */
export const formatDifficulty = (difficulty: string): string => {
  const parts = difficulty.split('_');
  if (parts.length === 2) {
    const tier = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    return `${tier} ${parts[1]}`;
  }
  return difficulty;
};

/**
 * 정답률 계산
 * @param acceptedCount - 정답 수
 * @param submissionCount - 제출 수
 * @param decimals - 소수점 자릿수 (기본 1)
 */
export const calculateAcceptanceRate = (
  acceptedCount: number,
  submissionCount: number,
  decimals: number = 1
): string => {
  if (submissionCount === 0) return '0';
  return ((acceptedCount / submissionCount) * 100).toFixed(decimals);
};
