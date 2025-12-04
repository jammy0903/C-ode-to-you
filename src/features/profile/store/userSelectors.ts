/**
 * @file userSelectors.ts
 * @description Memoized selectors for userStore
 *
 * @principles
 * - Performance: Selectors prevent unnecessary re-renders
 * - SRP: Each selector has a single purpose
 * - Reusability: Selectors can be shared across components/hooks
 */

import { useUserStore } from './userStore';

type UserState = ReturnType<typeof useUserStore.getState>;

// ==================== State Selectors ====================

/** Select user statistics */
export const selectStats = (state: UserState) => state.stats;

/** Select user activity */
export const selectActivity = (state: UserState) => state.activity;

/** Select user settings */
export const selectSettings = (state: UserState) => state.settings;

/** Select loading state */
export const selectIsLoading = (state: UserState) => state.isLoading;

/** Select error state */
export const selectError = (state: UserState) => state.error;

/** Combined user state for components */
export const selectUserState = (state: UserState) => ({
  stats: state.stats,
  activity: state.activity,
  settings: state.settings,
  isLoading: state.isLoading,
  error: state.error,
});

// ==================== Derived Selectors ====================

/** Check if stats are loaded */
export const selectHasStats = (state: UserState) => state.stats !== null;

/** Select solved count */
export const selectSolvedCount = (state: UserState) => state.stats?.solvedCount ?? 0;

/** Select current streak */
export const selectStreak = (state: UserState) => state.stats?.streak ?? 0;

/** Select user tier */
export const selectTier = (state: UserState) => state.stats?.tier ?? null;

/** Select theme setting */
export const selectTheme = (state: UserState) => state.settings?.theme ?? 'system';

/** Select code font size */
export const selectCodeFontSize = (state: UserState) => state.settings?.codeFontSize ?? 14;

/** Select notifications enabled */
export const selectNotificationsEnabled = (state: UserState) =>
  state.settings?.notifications ?? true;

/** Select activity for current year */
export const selectCurrentYearActivity = (state: UserState) => {
  const currentYear = new Date().getFullYear();
  return state.activity.filter(a => a.date.startsWith(String(currentYear)));
};

/** Select total activity count */
export const selectTotalActivityCount = (state: UserState) =>
  state.activity.reduce((sum, a) => sum + a.count, 0);

// ==================== Action Selectors ====================

/** Select store actions (stable references) */
export const selectUserActions = (state: UserState) => ({
  fetchStats: state.fetchStats,
  fetchActivity: state.fetchActivity,
  fetchSettings: state.fetchSettings,
  updateSettings: state.updateSettings,
});
