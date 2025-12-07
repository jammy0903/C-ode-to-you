import jwt from 'jsonwebtoken';
import { env } from './env';

export interface JwtPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access token
 */
export const generateAccessToken = (payload: Omit<JwtPayload, 'type'>): string => {
  return jwt.sign(
    { ...payload, type: 'access' } as object,
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
  );
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: Omit<JwtPayload, 'type'>): string => {
  return jwt.sign(
    { ...payload, type: 'refresh' } as object,
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN } as jwt.SignOptions
  );
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (payload: Omit<JwtPayload, 'type'>): TokenPair => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    const payload = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as JwtPayload;
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
};
