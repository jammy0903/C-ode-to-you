/**
 * @file userSelectors.ts
 * @description Memoized selectors for userStore (client-side UI state only)
 *
 * @principles
 * - Performance: Selectors prevent unnecessary re-renders
 * - SRP: Each selector has a single purpose
 * - Reusability: Selectors can be shared across components/hooks
 *
 * @note
 * Server state selectors have been removed. Use TanStack Query hooks instead:
 * - useUserStats() - User statistics and activity
 * - useUserSettings() - User settings
 */

import { useUserStore } from './userStore';

type UserUIState = ReturnType<typeof useUserStore.getState>;

// ==================== UI State Selectors ====================

/** Select currently selected year for activity view */
export const selectSelectedYear = (state: UserUIState) => state.selectedYear;

/** Select active tab in profile */
export const selectActiveTab = (state: UserUIState) => state.activeTab;

/** Combined UI state for components */
export const selectUserUIState = (state: UserUIState) => ({
  selectedYear: state.selectedYear,
  activeTab: state.activeTab,
});

// ==================== Action Selectors ====================

/** Select store actions (stable references) */
export const selectUserUIActions = (state: UserUIState) => ({
  setSelectedYear: state.setSelectedYear,
  setActiveTab: state.setActiveTab,
  reset: state.reset,
});
