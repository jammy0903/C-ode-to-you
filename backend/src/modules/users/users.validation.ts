import { z } from 'zod';

/**
 * Get user activity query schema
 */
export const getUserActivitySchema = z.object({
  query: z.object({
    days: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 7))
      .refine((val) => val > 0 && val <= 365, {
        message: 'Days must be between 1 and 365',
      }),
  }),
});

/**
 * Update settings schema
 */
export const updateSettingsSchema = z.object({
  body: z.object({
    editor: z
      .object({
        fontSize: z
          .number()
          .min(8)
          .max(32)
          .optional()
          .describe('Font size (8-32)'),
        theme: z.enum(['light', 'dark']).optional(),
        tabSize: z.number().min(2).max(8).optional().describe('Tab size (2-8)'),
      })
      .optional(),
    ai: z
      .object({
        hintLevel: z
          .enum(['beginner', 'intermediate', 'advanced'])
          .optional()
          .describe('AI hint difficulty level'),
      })
      .optional(),
    github: z
      .object({
        autoCommit: z
          .boolean()
          .optional()
          .describe('Enable automatic GitHub commits'),
      })
      .optional(),
    notifications: z
      .object({
        email: z.boolean().optional().describe('Email notifications'),
        push: z.boolean().optional().describe('Push notifications'),
      })
      .optional(),
  }),
});
