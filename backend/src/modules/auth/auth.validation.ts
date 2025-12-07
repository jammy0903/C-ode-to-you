/**
 * @file auth.validation.ts
 * @description Zod validation schemas for authentication endpoints
 *
 * ⚠️ CRITICAL: 프론트엔드 API 요청의 필드명과 정확히 일치해야 함!
 * - 프론트엔드가 보내는 필드명 != 스키마 필드명 → validation 에러 발생
 * - 에러가 컨트롤러에 도달하기 전에 차단되어 디버깅이 어려움
 *
 * @see auth.api.ts (frontend) - API 요청 필드 정의
 * @see auth.controller.ts - 컨트롤러에서 기대하는 필드명
 */

import { z } from 'zod';

export const kakaoLoginSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Authorization code is required'),
  }),
});

/**
 * Google OAuth Login Schema
 * ⚠️ 프론트엔드는 idToken만 전송 (Google 권장 방식)
 * - 이전: { code } → authorization code 방식
 * - 현재: { idToken } → ID token 검증 방식 (2024-2025 권장)
 */
export const googleLoginSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, 'ID token is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});
