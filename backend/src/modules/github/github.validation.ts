import { z } from 'zod';

/**
 * Connect GitHub Account
 */
export const connectGitHubSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Authorization code is required'),
    redirectUri: z.string().url('Invalid redirect URI'),
  }),
});

/**
 * Create Commit
 */
export const createCommitSchema = z.object({
  body: z.object({
    submissionId: z.string().uuid('Invalid submission ID'),
  }),
});

/**
 * Sync History
 */
export const syncHistorySchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export type ConnectGitHubInput = z.infer<typeof connectGitHubSchema>;
export type CreateCommitInput = z.infer<typeof createCommitSchema>;
export type SyncHistoryInput = z.infer<typeof syncHistorySchema>;
