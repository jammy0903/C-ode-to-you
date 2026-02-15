import { HttpClient } from '../utils/http';
import { AuthTokens } from '../types';

export class AuthModule {
  constructor(private http: HttpClient) {}

  /**
   * Authenticate with Google OAuth token
   */
  async loginWithGoogle(idToken: string): Promise<AuthTokens> {
    return this.http.post<AuthTokens>('/api/auth/google', { idToken });
  }

  /**
   * Authenticate with Kakao OAuth code
   */
  async loginWithKakao(code: string): Promise<AuthTokens> {
    return this.http.post<AuthTokens>('/api/auth/kakao', { code });
  }

  /**
   * Refresh access token
   */
  async refresh(refreshToken: string): Promise<AuthTokens> {
    return this.http.post<AuthTokens>('/api/auth/refresh', { refreshToken });
  }

  /**
   * Logout (invalidate token)
   */
  async logout(): Promise<void> {
    await this.http.post('/api/auth/logout');
  }

  /**
   * Get current user profile
   */
  async me(): Promise<AuthTokens['user']> {
    return this.http.get<AuthTokens['user']>('/api/auth/me');
  }
}
