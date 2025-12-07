import { z } from 'zod';

export const getProblemListSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val) : 20)),
    tags: z.string().optional(),
    // Baekjoon tier string like bronze_5, silver_3, gold_1, etc.
    difficulty: z
      .string()
      .regex(/^(bronze|silver|gold|platinum|diamond|ruby)_[1-5]$/, 'Invalid difficulty tier')
      .optional(),
    status: z.enum(['unsolved', 'attempted', 'solved']).optional(),
  }),
});

export const searchProblemsSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query is required'),
  }),
});

export const getProblemDetailSchema = z.object({
  params: z.object({
    problemId: z.string().uuid('Invalid problem ID'),
  }),
});
