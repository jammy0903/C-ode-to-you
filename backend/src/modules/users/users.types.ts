import { User } from '@prisma/client';

/**
 * User statistics response
 */
export interface UserStatistics {
  totalSolved: number;
  totalAttempts: number;
  successRate: number;
  byDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  currentStreak: number;
  longestStreak: number;
  recentActivity: Array<{
    date: string;
    solved: number;
    attempted: number;
  }>;
}

/**
 * Daily activity data
 */
export interface DailyActivity {
  date: string;
  submissions: number;
  solved: number;
  problems: number[];
}

/**
 * User activity response
 */
export interface UserActivity {
  activity: DailyActivity[];
}

/**
 * User settings
 */
export interface UserSettings {
  editor: {
    fontSize: number;
    theme: 'light' | 'dark';
    tabSize: number;
  };
  ai: {
    hintLevel: 'beginner' | 'intermediate' | 'advanced';
  };
  github: {
    autoCommit: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
  };
}

/**
 * Update settings request
 */
export interface UpdateSettingsRequest {
  editor?: Partial<UserSettings['editor']>;
  ai?: Partial<UserSettings['ai']>;
  github?: Partial<UserSettings['github']>;
  notifications?: Partial<UserSettings['notifications']>;
}

/**
 * User profile response
 */
export interface UserProfile extends Omit<User, 'providerId'> {
  stats: {
    totalSolved: number;
    totalAttempts: number;
  };
}
