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
 * @returns
 * - isConnected: boolean - GitHub connection status (placeholder)
 * - sync(): Promise<void> - Sync to GitHub (placeholder)
 */

export const useGitHub = () => {
  // Currently GitHub integration is minimal/placeholder
  // TODO: Implement with TanStack Query when GitHub integration is ready

  return {
    isConnected: false,
    sync: async () => {
      console.log('Sync GitHub (Not Implemented)');
    },
  };
};
