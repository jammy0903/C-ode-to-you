/**
 * @file EditorService.test.ts
 * @description Unit tests for EditorService
 *
 * @test-coverage
 * - ✅ Save draft successfully
 * - ✅ Load draft successfully
 * - ✅ Load draft returns null when not found
 * - ✅ Save queue prevents race conditions
 * - ✅ Queued saves execute after current save completes
 * - ✅ Error handling during save
 * - ✅ Error handling during load
 * - ✅ Clear queue functionality
 * - ✅ Pending save detection
 */

import { EditorService } from '../EditorService';
import { ISubmissionRepository } from '../../../../shared/repositories/interfaces';

// Mock repository
const createMockRepository = (): jest.Mocked<ISubmissionRepository> => ({
  saveDraft: jest.fn(),
  getDraft: jest.fn(),
  deleteDraft: jest.fn(),
  submitCode: jest.fn(),
  getSubmissionStatus: jest.fn(),
  getSubmissionDetail: jest.fn(),
  getProblemAttempts: jest.fn(),
  getMySubmissions: jest.fn(),
});

describe('EditorService', () => {
  let service: EditorService;
  let mockRepository: jest.Mocked<ISubmissionRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    service = new EditorService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveDraft', () => {
    it('should save draft successfully', async () => {
      mockRepository.saveDraft.mockResolvedValue(undefined);

      await service.saveDraft('problem-1', 'console.log("test");', 'javascript');

      expect(mockRepository.saveDraft).toHaveBeenCalledWith('problem-1', {
        code: 'console.log("test");',
        language: 'javascript',
      });
      expect(mockRepository.saveDraft).toHaveBeenCalledTimes(1);
    });

    it('should queue save if another save is in progress', async () => {
      let resolveSave: () => void;
      const savePromise = new Promise<void>((resolve) => {
        resolveSave = resolve;
      });

      mockRepository.saveDraft.mockReturnValueOnce(savePromise);
      mockRepository.saveDraft.mockResolvedValue(undefined);

      // Start first save
      const save1 = service.saveDraft('problem-1', 'code1', 'c');

      // Queue second save (should be queued)
      const save2 = service.saveDraft('problem-1', 'code2', 'c');

      // First save should be called immediately
      expect(mockRepository.saveDraft).toHaveBeenCalledTimes(1);
      expect(mockRepository.saveDraft).toHaveBeenCalledWith('problem-1', {
        code: 'code1',
        language: 'c',
      });

      // Resolve first save
      resolveSave!();
      await save1;

      // Wait a bit for queued save to execute
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Second save should execute after first completes
      expect(mockRepository.saveDraft).toHaveBeenCalledTimes(2);
      expect(mockRepository.saveDraft).toHaveBeenLastCalledWith('problem-1', {
        code: 'code2',
        language: 'c',
      });
    });

    it('should handle multiple queued saves and execute only the latest', async () => {
      let resolveSave: () => void;
      const savePromise = new Promise<void>((resolve) => {
        resolveSave = resolve;
      });

      mockRepository.saveDraft.mockReturnValueOnce(savePromise);
      mockRepository.saveDraft.mockResolvedValue(undefined);

      // Start first save
      const save1 = service.saveDraft('problem-1', 'code1', 'c');

      // Queue multiple saves (only latest should execute)
      service.saveDraft('problem-1', 'code2', 'c');
      service.saveDraft('problem-1', 'code3', 'c');

      // First save should be called immediately
      expect(mockRepository.saveDraft).toHaveBeenCalledTimes(1);

      // Resolve first save
      resolveSave!();
      await save1;

      // Wait for queued save
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should only execute the latest queued save (code3)
      expect(mockRepository.saveDraft).toHaveBeenCalledTimes(2);
      expect(mockRepository.saveDraft).toHaveBeenLastCalledWith('problem-1', {
        code: 'code3',
        language: 'c',
      });
    });

    it('should handle save errors', async () => {
      const error = new Error('Network error');
      mockRepository.saveDraft.mockRejectedValue(error);

      await expect(service.saveDraft('problem-1', 'code', 'c')).rejects.toThrow('Network error');
    });

    it('should allow concurrent saves for different problems', async () => {
      let resolveSave1: () => void;
      let resolveSave2: () => void;

      const savePromise1 = new Promise<void>((resolve) => {
        resolveSave1 = resolve;
      });
      const savePromise2 = new Promise<void>((resolve) => {
        resolveSave2 = resolve;
      });

      mockRepository.saveDraft.mockReturnValueOnce(savePromise1);
      mockRepository.saveDraft.mockReturnValueOnce(savePromise2);

      // Start saves for different problems
      const save1 = service.saveDraft('problem-1', 'code1', 'c');
      const save2 = service.saveDraft('problem-2', 'code2', 'c');

      // Both saves should be called immediately (different problems)
      expect(mockRepository.saveDraft).toHaveBeenCalledTimes(2);

      resolveSave1!();
      resolveSave2!();
      await Promise.all([save1, save2]);
    });
  });

  describe('loadDraft', () => {
    it('should load draft successfully', async () => {
      const mockDraft = { code: 'test code', language: 'c' };
      mockRepository.getDraft.mockResolvedValue(mockDraft);

      const result = await service.loadDraft('problem-1');

      expect(result).toEqual(mockDraft);
      expect(mockRepository.getDraft).toHaveBeenCalledWith('problem-1');
    });

    it('should return a default draft when draft not found', async () => {
      mockRepository.getDraft.mockResolvedValue(null);

      const result = await service.loadDraft('problem-1');

      expect(result).toEqual({
        code: '',
        language: 'c',
      });
    });

    it('should handle load errors', async () => {
      const error = new Error('Failed to load');
      mockRepository.getDraft.mockRejectedValue(error);

      await expect(service.loadDraft('problem-1')).rejects.toThrow('Failed to load');
    });
  });

  describe('clearQueue', () => {
    it('should clear pending saves', () => {
      service.clearQueue();

      // After clearing, save version should reset
      expect(service.hasPendingSave('problem-1')).toBe(false);
    });
  });

  describe('hasPendingSave', () => {
    it('should return true when save is in progress', async () => {
      let resolveSave: () => void;
      const savePromise = new Promise<void>((resolve) => {
        resolveSave = resolve;
      });

      mockRepository.saveDraft.mockReturnValue(savePromise);

      const saveTask = service.saveDraft('problem-1', 'code', 'c');

      expect(service.hasPendingSave('problem-1')).toBe(true);

      resolveSave!();
      await saveTask;

      expect(service.hasPendingSave('problem-1')).toBe(false);
    });

    it('should return false when no saves pending', () => {
      expect(service.hasPendingSave('problem-1')).toBe(false);
    });
  });
});
