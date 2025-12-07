import { z } from 'zod';

export const submitCodeSchema = z.object({
  params: z.object({
    problemId: z.string().uuid('Invalid problem ID'),
  }),
  body: z.object({
    code: z.string().min(1, 'Code is required'),
    language: z.string().default('c'),
  }),
});

export const getSubmissionStatusSchema = z.object({
  params: z.object({
    submissionId: z.string().uuid('Invalid submission ID'),
  }),
});

export const saveDraftSchema = z.object({
  params: z.object({
    problemId: z.string().uuid('Invalid problem ID'),
  }),
  body: z.object({
    code: z.string().min(1, 'Code is required'),
  }),
});

export const getSubmissionHistorySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val) : 20)),
  }),
});
