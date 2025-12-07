/**
 * @file ProblemService.test.ts
 * @description Unit tests for ProblemService
 *
 * @test-coverage
 * - ✅ Fetch problems successfully
 * - ✅ Fetch problems failure
 * - ✅ Fetch problem detail (cache miss)
 * - ✅ Fetch problem detail (cache hit)
 * - ✅ Fetch problem detail (force refresh)
 * - ✅ Search problems successfully
 * - ✅ Get cached detail
 * - ✅ Cache expiration
 * - ✅ Invalidate cache
 */

import { ProblemService } from '../ProblemService';
import { IProblemRepository, ProblemListResult } from '../../../../shared/repositories/interfaces';
import { Problem, PaginationMeta } from '../../../../shared/types/api.types';

// Mock data
const mockPagination: PaginationMeta = {
  currentPage: 1,
  totalPages: 5,
  totalItems: 100,
  itemsPerPage: 20,
};

const mockProblem: Problem = {
  id: 'problem-1',
  number: 1000,
  title: 'Hello World',
  difficulty: 'bronze_5',
  tags: ['implementation'],
  acceptedCount: 850,
  submissionCount: 1000,
  description: 'Print Hello World',
};

const mockProblemSummary: Problem = {
  ...mockProblem,
  description: undefined, // List items don't have description
};

const mockListResult: ProblemListResult = {
  items: [mockProblemSummary],
  pagination: mockPagination,
};

// Create mock repository
const createMockProblemRepository = (): jest.Mocked<IProblemRepository> => ({
  getProblems: jest.fn(),
  getProblemDetail: jest.fn(),
  searchProblems: jest.fn(),
  getProblemStats: jest.fn(),
});

describe('ProblemService', () => {
  let problemService: ProblemService;
  let mockRepo: jest.Mocked<IProblemRepository>;

  beforeEach(() => {
    mockRepo = createMockProblemRepository();
    problemService = new ProblemService(mockRepo);
    jest.clearAllMocks();
  });

  describe('fetchProblems', () => {
    it('should fetch problems successfully', async () => {
      mockRepo.getProblems.mockResolvedValue(mockListResult);

      const result = await problemService.fetchProblems({ page: 1, limit: 20 });

      expect(mockRepo.getProblems).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(result).toEqual(mockListResult);
    });

    it('should fetch problems with default params', async () => {
      mockRepo.getProblems.mockResolvedValue(mockListResult);

      await problemService.fetchProblems();

      expect(mockRepo.getProblems).toHaveBeenCalledWith(undefined);
    });

    it('should throw error on failure', async () => {
      mockRepo.getProblems.mockRejectedValue(new Error('Network error'));

      await expect(problemService.fetchProblems()).rejects.toThrow('Network error');
    });
  });

  describe('fetchProblemDetail', () => {
    it('should fetch problem detail on cache miss', async () => {
      mockRepo.getProblemDetail.mockResolvedValue(mockProblem);

      const result = await problemService.fetchProblemDetail('problem-1');

      expect(mockRepo.getProblemDetail).toHaveBeenCalledWith('problem-1');
      expect(result).toEqual(mockProblem);
    });

    it('should return cached detail on cache hit', async () => {
      mockRepo.getProblemDetail.mockResolvedValue(mockProblem);

      // First call - cache miss
      await problemService.fetchProblemDetail('problem-1');
      expect(mockRepo.getProblemDetail).toHaveBeenCalledTimes(1);

      // Second call - cache hit
      const result = await problemService.fetchProblemDetail('problem-1');
      expect(mockRepo.getProblemDetail).toHaveBeenCalledTimes(1); // Still 1
      expect(result).toEqual(mockProblem);
    });

    it('should fetch fresh data when forceRefresh is true', async () => {
      mockRepo.getProblemDetail.mockResolvedValue(mockProblem);

      // First call
      await problemService.fetchProblemDetail('problem-1');

      // Force refresh
      await problemService.fetchProblemDetail('problem-1', true);

      expect(mockRepo.getProblemDetail).toHaveBeenCalledTimes(2);
    });

    it('should fetch when cached item has no description', async () => {
      mockRepo.getProblemDetail.mockResolvedValue(mockProblem);

      // Manually cache a summary (no description)
      (problemService as any).detailCache.set('problem-1', {
        data: mockProblemSummary,
        timestamp: Date.now(),
      });

      await problemService.fetchProblemDetail('problem-1');

      expect(mockRepo.getProblemDetail).toHaveBeenCalled();
    });

    it('should throw error on failure', async () => {
      mockRepo.getProblemDetail.mockRejectedValue(new Error('Not found'));

      await expect(problemService.fetchProblemDetail('problem-1')).rejects.toThrow('Not found');
    });
  });

  describe('searchProblems', () => {
    it('should search problems successfully', async () => {
      mockRepo.searchProblems.mockResolvedValue(mockListResult);

      const result = await problemService.searchProblems('hello');

      expect(mockRepo.searchProblems).toHaveBeenCalledWith('hello');
      expect(result).toEqual(mockListResult);
    });

    it('should throw error on failure', async () => {
      mockRepo.searchProblems.mockRejectedValue(new Error('Search failed'));

      await expect(problemService.searchProblems('test')).rejects.toThrow('Search failed');
    });
  });

  describe('getCachedDetail', () => {
    it('should return cached detail if valid', async () => {
      mockRepo.getProblemDetail.mockResolvedValue(mockProblem);
      await problemService.fetchProblemDetail('problem-1');

      const cached = problemService.getCachedDetail('problem-1');

      expect(cached).toEqual(mockProblem);
    });

    it('should return null if not cached', () => {
      const cached = problemService.getCachedDetail('unknown');

      expect(cached).toBeNull();
    });

    it('should return null if cache expired', async () => {
      mockRepo.getProblemDetail.mockResolvedValue(mockProblem);
      await problemService.fetchProblemDetail('problem-1');

      // Simulate cache expiration
      const cacheEntry = (problemService as any).detailCache.get('problem-1');
      cacheEntry.timestamp = Date.now() - 10 * 60 * 1000; // 10 minutes ago

      const cached = problemService.getCachedDetail('problem-1');

      expect(cached).toBeNull();
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate specific problem cache', async () => {
      mockRepo.getProblemDetail.mockResolvedValue(mockProblem);
      await problemService.fetchProblemDetail('problem-1');

      problemService.invalidateCache('problem-1');

      expect(problemService.getCachedDetail('problem-1')).toBeNull();
    });

    it('should invalidate all cache when no id specified', async () => {
      mockRepo.getProblemDetail.mockResolvedValue(mockProblem);
      await problemService.fetchProblemDetail('problem-1');
      await problemService.fetchProblemDetail('problem-2');

      problemService.invalidateCache();

      expect(problemService.getCachedDetail('problem-1')).toBeNull();
      expect(problemService.getCachedDetail('problem-2')).toBeNull();
    });
  });
});
