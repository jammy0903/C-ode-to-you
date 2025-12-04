/**
 * @file useGitHub.ts
 * @description GitHub integration hook - placeholder for future implementation
 * 
 * @principles
 * - SRP: ✅ Single responsibility: GitHub integration state (placeholder)
 * - CQS: ✅ Queries (isConnected) return data, Commands (sync) mutate
 * - DIP: ⚠️ Placeholder - should use IGitHubRepository when implemented
 * - Composition: ⚠️ Placeholder - minimal composition
 * 
 * @functions
 * - useGitHub(): GitHubHookReturn - Hook that returns GitHub integration state
 * 
 * @returns
 * - isConnected: boolean - GitHub connection status (placeholder)
 * - sync(): Promise<void> - Sync to GitHub (placeholder)
 */

import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';

export const useGitHub = () => {
  // Currently GitHub integration is minimal/placeholder
  // We can expose some placeholder state here
  const store = useUserStore();

  return {
    isConnected: false, // TODO: Add isConnected to User model/store
    sync: async () => {
      console.log('Sync GitHub (Not Implemented)');
    },
  };
};

