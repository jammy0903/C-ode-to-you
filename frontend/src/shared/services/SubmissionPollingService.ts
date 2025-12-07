/**
 * @file SubmissionPollingService.ts
 * @description Submission polling service - handles polling logic extracted from Store
 * 
 * @principles
 * - SRP: ✅ Single responsibility: polling logic only
 * - CQS: ✅ Commands (startPolling, stopPolling) mutate, Queries (isPolling, getAttemptCount) return data
 * - DIP: ✅ Depends on ISubmissionRepository interface
 * - Composition: ✅ Composes repository for data access
 * 
 * @functions
 * - startPolling(submissionId: string, options: PollingOptions): Promise<void> - Start polling
 * - stopPolling(): void - Stop polling
 * - cancel(): void - Cancel polling (alias for stopPolling)
 * - isPolling(): boolean - Check if currently polling (Query)
 * - getAttemptCount(): number - Get current attempt count (Query)
 * - isFinalStatus(status: string): boolean - Static: check if status is final (Query)
 * 
 * @dependencies
 * - ISubmissionRepository - For fetching submission status
 */

import { ISubmissionRepository } from '../repositories/interfaces';
import { Submission } from '../types/api.types';

export interface PollingOptions {
  /**
   * Polling interval in milliseconds
   * @default 2000
   */
  intervalMs?: number;

  /**
   * Maximum polling attempts (0 = infinite)
   * @default 0
   */
  maxAttempts?: number;

  /**
   * Callback called on each status update
   */
  onStatusUpdate: (submission: Submission) => void;

  /**
   * Callback called when polling completes (final status reached)
   */
  onComplete?: (submission: Submission) => void;

  /**
   * Callback called on error
   */
  onError?: (error: Error) => void;
}

/**
 * Final submission statuses that should stop polling
 */
const FINAL_STATUSES: readonly string[] = [
  'accepted',
  'wrong_answer',
  'compile_error',
  'runtime_error',
  'time_limit',
  'memory_limit',
];

export class SubmissionPollingService {
  private intervalId: NodeJS.Timeout | null = null;
  private attemptCount = 0;
  private isCancelled = false;

  constructor(private submissionRepository: ISubmissionRepository) {}

  /**
   * Check if a status is final (polling should stop)
   */
  static isFinalStatus(status: string): boolean {
    return FINAL_STATUSES.includes(status);
  }

  /**
   * Start polling for submission status
   */
  async startPolling(submissionId: string, options: PollingOptions): Promise<void> {
    const { intervalMs = 2000, maxAttempts = 0, onStatusUpdate, onComplete, onError } = options;

    // Reset state
    this.attemptCount = 0;
    this.isCancelled = false;

    // Initial poll
    await this.pollOnce(submissionId, onStatusUpdate, onComplete, onError);

    // Set up interval for subsequent polls
    this.intervalId = setInterval(async () => {
      // Check cancellation
      if (this.isCancelled) {
        this.stopPolling();
        return;
      }

      // Check max attempts
      if (maxAttempts > 0 && this.attemptCount >= maxAttempts) {
        this.stopPolling();
        return;
      }

      await this.pollOnce(submissionId, onStatusUpdate, onComplete, onError);
    }, intervalMs);
  }

  /**
   * Poll once and handle the result
   */
  private async pollOnce(
    submissionId: string,
    onStatusUpdate: (submission: Submission) => void,
    onComplete?: (submission: Submission) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      this.attemptCount++;

      const submission = await this.submissionRepository.getSubmissionStatus(submissionId);

      // Call status update callback
      onStatusUpdate(submission);

      // Check if final status
      if (SubmissionPollingService.isFinalStatus(submission.status)) {
        this.stopPolling();
        onComplete?.(submission);
      }
    } catch (error) {
      console.error('Polling error:', error);
      onError?.(error instanceof Error ? error : new Error('Unknown polling error'));
      // Don't stop polling on error - might be temporary network issue
    }
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isCancelled = true;
  }

  /**
   * Cancel ongoing polling
   */
  cancel(): void {
    this.stopPolling();
  }

  /**
   * Check if currently polling
   */
  isPolling(): boolean {
    return this.intervalId !== null && !this.isCancelled;
  }

  /**
   * Get current attempt count
   */
  getAttemptCount(): number {
    return this.attemptCount;
  }
}

/**
 * Factory function for creating polling service
 */
export function createPollingService(repository: ISubmissionRepository): SubmissionPollingService {
  return new SubmissionPollingService(repository);
}
