/**
 * @file SubmissionPollingService.test.ts
 * @description Unit tests for SubmissionPollingService
 */

import { SubmissionPollingService, PollingOptions } from '../SubmissionPollingService';
import { ISubmissionRepository } from '../../repositories/interfaces';
import { Submission } from '../../types/api.types';

// Mock implementation of ISubmissionRepository (only getSubmissionStatus is used by SubmissionPollingService)
class MockSubmissionRepository {
  private statusResponses: Submission[] = [];
  private callIndex = 0;

  setStatusResponses(responses: Submission[]) {
    this.statusResponses = responses;
    this.callIndex = 0;
  }

  async getSubmissionStatus(id: string): Promise<Submission> {
    if (this.callIndex >= this.statusResponses.length) {
      throw new Error('No more mock responses');
    }
    const response = this.statusResponses[this.callIndex];
    this.callIndex++;
    return response;
  }

  getCallCount(): number {
    return this.callIndex;
  }

  // Stub methods (not used by SubmissionPollingService)
  submitCode = jest.fn();
  getSubmissionDetail = jest.fn();
  getProblemAttempts = jest.fn();
  getMySubmissions = jest.fn();
  saveDraft = jest.fn();
  getDraft = jest.fn();
  deleteDraft = jest.fn();
}

// Helper to create mock submission
function createMockSubmission(status: string, id = 'test-submission-id'): Submission {
  return {
    id,
    problemId: 'problem-123',
    userId: 'user-456',
    code: 'int main() { return 0; }',
    language: 'c',
    status,
    verdict: status === 'accepted' ? 'accepted' : undefined,
    createdAt: new Date().toISOString(),
    executionTime: status === 'accepted' ? 100 : undefined,
    memoryUsage: status === 'accepted' ? 2048 : undefined,
  } as Submission;
}

describe('SubmissionPollingService', () => {
  let mockRepo: MockSubmissionRepository;
  let service: SubmissionPollingService;

  beforeEach(() => {
    mockRepo = new MockSubmissionRepository();
    service = new SubmissionPollingService(mockRepo as ISubmissionRepository);
    jest.useFakeTimers();
  });

  afterEach(() => {
    service.stopPolling();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('isFinalStatus', () => {
    it('should return true for final statuses', () => {
      expect(SubmissionPollingService.isFinalStatus('accepted')).toBe(true);
      expect(SubmissionPollingService.isFinalStatus('wrong_answer')).toBe(true);
      expect(SubmissionPollingService.isFinalStatus('compile_error')).toBe(true);
      expect(SubmissionPollingService.isFinalStatus('runtime_error')).toBe(true);
      expect(SubmissionPollingService.isFinalStatus('time_limit')).toBe(true);
      expect(SubmissionPollingService.isFinalStatus('memory_limit')).toBe(true);
    });

    it('should return false for non-final statuses', () => {
      expect(SubmissionPollingService.isFinalStatus('judging')).toBe(false);
      expect(SubmissionPollingService.isFinalStatus('pending')).toBe(false);
      expect(SubmissionPollingService.isFinalStatus('unknown')).toBe(false);
    });
  });

  describe('startPolling', () => {
    it('should call onStatusUpdate on first poll', async () => {
      const onStatusUpdate = jest.fn();
      const judging = createMockSubmission('judging');

      mockRepo.setStatusResponses([judging]);

      await service.startPolling('test-id', { onStatusUpdate });

      expect(onStatusUpdate).toHaveBeenCalledWith(judging);
      expect(onStatusUpdate).toHaveBeenCalledTimes(1);
    });

    it('should call onComplete when final status is reached', async () => {
      const onStatusUpdate = jest.fn();
      const onComplete = jest.fn();
      const accepted = createMockSubmission('accepted');

      mockRepo.setStatusResponses([accepted]);

      await service.startPolling('test-id', { onStatusUpdate, onComplete });

      expect(onStatusUpdate).toHaveBeenCalledWith(accepted);
      expect(onComplete).toHaveBeenCalledWith(accepted);
      expect(service.isPolling()).toBe(false);
    });

    it('should continue polling until final status', async () => {
      const onStatusUpdate = jest.fn();
      const onComplete = jest.fn();

      const judging1 = createMockSubmission('judging');
      const judging2 = createMockSubmission('judging');
      const accepted = createMockSubmission('accepted');

      mockRepo.setStatusResponses([judging1, judging2, accepted]);

      await service.startPolling('test-id', {
        onStatusUpdate,
        onComplete,
        intervalMs: 100,
      });

      // First call (initial poll)
      expect(onStatusUpdate).toHaveBeenCalledTimes(1);
      expect(onStatusUpdate).toHaveBeenCalledWith(judging1);

      // Advance timer for second poll
      jest.advanceTimersByTime(100);
      await Promise.resolve(); // Wait for async operation

      expect(onStatusUpdate).toHaveBeenCalledTimes(2);
      expect(onStatusUpdate).toHaveBeenCalledWith(judging2);

      // Advance timer for third poll
      jest.advanceTimersByTime(100);
      await Promise.resolve();

      expect(onStatusUpdate).toHaveBeenCalledTimes(3);
      expect(onStatusUpdate).toHaveBeenCalledWith(accepted);
      expect(onComplete).toHaveBeenCalledWith(accepted);
      expect(service.isPolling()).toBe(false);
    });

    it('should respect maxAttempts option', async () => {
      const onStatusUpdate = jest.fn();

      const judging1 = createMockSubmission('judging');
      const judging2 = createMockSubmission('judging');
      const judging3 = createMockSubmission('judging');

      mockRepo.setStatusResponses([judging1, judging2, judging3]);

      await service.startPolling('test-id', {
        onStatusUpdate,
        intervalMs: 100,
        maxAttempts: 2,
      });

      // First poll
      expect(onStatusUpdate).toHaveBeenCalledTimes(1);

      // Second poll
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      expect(onStatusUpdate).toHaveBeenCalledTimes(2);

      // Should stop after maxAttempts
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      expect(onStatusUpdate).toHaveBeenCalledTimes(2); // No more calls
      expect(service.isPolling()).toBe(false);
    });

    it('should call onError when polling fails', async () => {
      const onStatusUpdate = jest.fn();
      const onError = jest.fn();

      // First call succeeds, second call fails
      const judging = createMockSubmission('judging');
      mockRepo.setStatusResponses([judging]);

      await service.startPolling('test-id', {
        onStatusUpdate,
        onError,
        intervalMs: 100,
      });

      expect(onStatusUpdate).toHaveBeenCalledTimes(1);

      // Advance timer - should trigger error
      jest.advanceTimersByTime(100);
      await Promise.resolve();

      expect(onError).toHaveBeenCalled();
      // Polling should continue even after error
      expect(service.isPolling()).toBe(true);
    });
  });

  describe('stopPolling', () => {
    it('should stop ongoing polling', async () => {
      const onStatusUpdate = jest.fn();

      const judging = createMockSubmission('judging');
      mockRepo.setStatusResponses([judging, judging, judging]);

      await service.startPolling('test-id', {
        onStatusUpdate,
        intervalMs: 100,
      });

      expect(onStatusUpdate).toHaveBeenCalledTimes(1);
      expect(service.isPolling()).toBe(true);

      service.stopPolling();

      expect(service.isPolling()).toBe(false);

      // Advance timer - should not trigger more polls
      jest.advanceTimersByTime(100);
      await Promise.resolve();

      expect(onStatusUpdate).toHaveBeenCalledTimes(1); // No more calls
    });
  });

  describe('cancel', () => {
    it('should be alias for stopPolling', async () => {
      const onStatusUpdate = jest.fn();

      const judging = createMockSubmission('judging');
      mockRepo.setStatusResponses([judging]);

      await service.startPolling('test-id', { onStatusUpdate });

      expect(service.isPolling()).toBe(true);

      service.cancel();

      expect(service.isPolling()).toBe(false);
    });
  });

  describe('isPolling', () => {
    it('should return false initially', () => {
      expect(service.isPolling()).toBe(false);
    });

    it('should return true during polling', async () => {
      const judging = createMockSubmission('judging');
      mockRepo.setStatusResponses([judging]);

      await service.startPolling('test-id', { onStatusUpdate: jest.fn() });

      expect(service.isPolling()).toBe(true);
    });

    it('should return false after polling stops', async () => {
      const accepted = createMockSubmission('accepted');
      mockRepo.setStatusResponses([accepted]);

      await service.startPolling('test-id', { onStatusUpdate: jest.fn() });

      expect(service.isPolling()).toBe(false);
    });
  });

  describe('getAttemptCount', () => {
    it('should return 0 initially', () => {
      expect(service.getAttemptCount()).toBe(0);
    });

    it('should increment with each poll', async () => {
      const judging1 = createMockSubmission('judging');
      const judging2 = createMockSubmission('judging');
      const accepted = createMockSubmission('accepted');

      mockRepo.setStatusResponses([judging1, judging2, accepted]);

      await service.startPolling('test-id', {
        onStatusUpdate: jest.fn(),
        intervalMs: 100,
      });

      expect(service.getAttemptCount()).toBe(1);

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      expect(service.getAttemptCount()).toBe(2);

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      expect(service.getAttemptCount()).toBe(3);
    });

    it('should reset on new polling session', async () => {
      const judging = createMockSubmission('judging');
      mockRepo.setStatusResponses([judging]);

      await service.startPolling('test-id-1', {
        onStatusUpdate: jest.fn(),
      });

      expect(service.getAttemptCount()).toBe(1);

      service.stopPolling();

      mockRepo.setStatusResponses([judging]);

      await service.startPolling('test-id-2', {
        onStatusUpdate: jest.fn(),
      });

      expect(service.getAttemptCount()).toBe(1); // Reset
    });
  });

  describe('createPollingService factory', () => {
    it('should create service instance', async () => {
      const { createPollingService } = await import('../SubmissionPollingService');
      const service = createPollingService(mockRepo as ISubmissionRepository);

      expect(service).toBeInstanceOf(SubmissionPollingService);
    });
  });
});
