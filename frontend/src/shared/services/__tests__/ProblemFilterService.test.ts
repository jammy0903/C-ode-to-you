/**
 * @file ProblemFilterService.test.ts
 * @description Unit tests for ProblemFilterService
 */

import { ProblemFilterService, FilterState } from '../ProblemFilterService';
import { GetProblemsParams } from '../../api/endpoints/problems.api';

describe('ProblemFilterService', () => {
  describe('createEmptyFilter', () => {
    it('should create filter with default pagination', () => {
      const filter = ProblemFilterService.createEmptyFilter();

      expect(filter).toEqual({
        page: 1,
        limit: 20,
      });
    });
  });

  describe('mergeFilters', () => {
    it('should merge new filters with existing ones', () => {
      const current: FilterState = {
        page: 2,
        limit: 20,
        tags: ['array'],
      };

      const updates: Partial<FilterState> = {
        difficulty: 'medium',
      };

      const result = ProblemFilterService.mergeFilters(current, updates);

      expect(result).toEqual({
        page: 1, // Reset to 1 when filter changes
        limit: 20,
        tags: ['array'],
        difficulty: 'medium',
      });
    });

    it('should NOT reset page when only pagination changes', () => {
      const current: FilterState = {
        page: 2,
        limit: 20,
        tags: ['array'],
      };

      const updates: Partial<FilterState> = {
        page: 3,
      };

      const result = ProblemFilterService.mergeFilters(current, updates);

      expect(result.page).toBe(3); // Page should update, not reset
    });

    it('should reset page to 1 when filter changes', () => {
      const current: FilterState = {
        page: 5,
        limit: 20,
      };

      const updates: Partial<FilterState> = {
        tags: ['dp'],
      };

      const result = ProblemFilterService.mergeFilters(current, updates);

      expect(result.page).toBe(1);
    });
  });

  describe('toApiParams', () => {
    it('should convert FilterState to API params', () => {
      const filter: FilterState = {
        page: 2,
        limit: 20,
        tags: ['array', 'sorting'],
        difficulty: 'medium',
        status: 'unsolved',
        search: 'binary',
      };

      const params = ProblemFilterService.toApiParams(filter);

      expect(params).toEqual({
        page: 2,
        limit: 20,
        tags: 'array,sorting',
        difficulty: 'medium',
        status: 'unsolved',
        q: 'binary',
      });
    });

    it('should handle undefined values', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
      };

      const params = ProblemFilterService.toApiParams(filter);

      expect(params).toEqual({
        page: 1,
        limit: 20,
        tags: undefined,
        difficulty: undefined,
        status: undefined,
        q: undefined,
      });
    });
  });

  describe('fromApiParams', () => {
    it('should convert API params to FilterState', () => {
      const params: GetProblemsParams = {
        page: 2,
        limit: 20,
        tags: 'array,sorting',
        difficulty: 'medium',
        status: 'unsolved',
        q: 'binary',
      };

      const filter = ProblemFilterService.fromApiParams(params);

      expect(filter).toEqual({
        page: 2,
        limit: 20,
        tags: ['array', 'sorting'],
        difficulty: 'medium',
        status: 'unsolved',
        search: 'binary',
      });
    });

    it('should handle empty tags string', () => {
      const params: GetProblemsParams = {
        page: 1,
        limit: 20,
        tags: '',
      };

      const filter = ProblemFilterService.fromApiParams(params);

      expect(filter.tags).toEqual([]);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty filters', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
      };

      expect(ProblemFilterService.isEmpty(filter)).toBe(true);
    });

    it('should return false for filters with tags', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
        tags: ['array'],
      };

      expect(ProblemFilterService.isEmpty(filter)).toBe(false);
    });

    it('should return false for filters with difficulty', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
        difficulty: 'easy',
      };

      expect(ProblemFilterService.isEmpty(filter)).toBe(false);
    });

    it('should return false for filters with search', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
        search: 'test',
      };

      expect(ProblemFilterService.isEmpty(filter)).toBe(false);
    });
  });

  describe('clearFilters', () => {
    it('should clear all filters except pagination', () => {
      const filter: FilterState = {
        page: 5,
        limit: 20,
        tags: ['array'],
        difficulty: 'hard',
        status: 'solved',
        search: 'test',
      };

      const cleared = ProblemFilterService.clearFilters(filter);

      expect(cleared).toEqual({
        page: 1,
        limit: 20,
      });
    });
  });

  describe('addTag', () => {
    it('should add tag to empty tag list', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
      };

      const result = ProblemFilterService.addTag(filter, 'array');

      expect(result.tags).toEqual(['array']);
      expect(result.page).toBe(1);
    });

    it('should add tag to existing tags', () => {
      const filter: FilterState = {
        page: 2,
        limit: 20,
        tags: ['array'],
      };

      const result = ProblemFilterService.addTag(filter, 'sorting');

      expect(result.tags).toEqual(['array', 'sorting']);
      expect(result.page).toBe(1); // Reset page
    });

    it('should not add duplicate tag', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
        tags: ['array'],
      };

      const result = ProblemFilterService.addTag(filter, 'array');

      expect(result.tags).toEqual(['array']);
    });
  });

  describe('removeTag', () => {
    it('should remove tag from tag list', () => {
      const filter: FilterState = {
        page: 2,
        limit: 20,
        tags: ['array', 'sorting'],
      };

      const result = ProblemFilterService.removeTag(filter, 'array');

      expect(result.tags).toEqual(['sorting']);
      expect(result.page).toBe(1); // Reset page
    });

    it('should set tags to undefined when last tag removed', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
        tags: ['array'],
      };

      const result = ProblemFilterService.removeTag(filter, 'array');

      expect(result.tags).toBeUndefined();
    });

    it('should handle removing non-existent tag', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
        tags: ['array'],
      };

      const result = ProblemFilterService.removeTag(filter, 'sorting');

      expect(result.tags).toEqual(['array']);
    });
  });

  describe('toggleTag', () => {
    it('should add tag if not present', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
        tags: ['array'],
      };

      const result = ProblemFilterService.toggleTag(filter, 'sorting');

      expect(result.tags).toEqual(['array', 'sorting']);
    });

    it('should remove tag if present', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
        tags: ['array', 'sorting'],
      };

      const result = ProblemFilterService.toggleTag(filter, 'array');

      expect(result.tags).toEqual(['sorting']);
    });
  });

  describe('setDifficulty', () => {
    it('should set difficulty and reset page', () => {
      const filter: FilterState = {
        page: 5,
        limit: 20,
      };

      const result = ProblemFilterService.setDifficulty(filter, 'hard');

      expect(result.difficulty).toBe('hard');
      expect(result.page).toBe(1);
    });

    it('should clear difficulty when set to undefined', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
        difficulty: 'easy',
      };

      const result = ProblemFilterService.setDifficulty(filter, undefined);

      expect(result.difficulty).toBeUndefined();
    });
  });

  describe('setStatus', () => {
    it('should set status and reset page', () => {
      const filter: FilterState = {
        page: 3,
        limit: 20,
      };

      const result = ProblemFilterService.setStatus(filter, 'solved');

      expect(result.status).toBe('solved');
      expect(result.page).toBe(1);
    });
  });

  describe('setSearch', () => {
    it('should set search query and reset page', () => {
      const filter: FilterState = {
        page: 2,
        limit: 20,
      };

      const result = ProblemFilterService.setSearch(filter, 'binary search');

      expect(result.search).toBe('binary search');
      expect(result.page).toBe(1);
    });

    it('should trim whitespace', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
      };

      const result = ProblemFilterService.setSearch(filter, '  test  ');

      expect(result.search).toBe('test');
    });

    it('should set to undefined for empty string', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
        search: 'test',
      };

      const result = ProblemFilterService.setSearch(filter, '');

      expect(result.search).toBeUndefined();
    });
  });

  describe('nextPage', () => {
    it('should increment page', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
      };

      const result = ProblemFilterService.nextPage(filter);

      expect(result.page).toBe(2);
    });

    it('should handle undefined page', () => {
      const filter: FilterState = {
        limit: 20,
      };

      const result = ProblemFilterService.nextPage(filter);

      expect(result.page).toBe(2);
    });
  });

  describe('setPage', () => {
    it('should set specific page', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
      };

      const result = ProblemFilterService.setPage(filter, 5);

      expect(result.page).toBe(5);
    });

    it('should not allow page less than 1', () => {
      const filter: FilterState = {
        page: 2,
        limit: 20,
      };

      const result = ProblemFilterService.setPage(filter, 0);

      expect(result.page).toBe(1);
    });
  });

  describe('getSummary', () => {
    it('should return empty array for empty filters', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
      };

      const summary = ProblemFilterService.getSummary(filter);

      expect(summary).toEqual([]);
    });

    it('should return summary for all active filters', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
        tags: ['array', 'sorting'],
        difficulty: 'medium',
        status: 'unsolved',
        search: 'binary',
      };

      const summary = ProblemFilterService.getSummary(filter);

      expect(summary).toEqual([
        'Tags: array, sorting',
        'Difficulty: medium',
        'Status: unsolved',
        'Search: "binary"',
      ]);
    });
  });

  describe('countActiveFilters', () => {
    it('should return 0 for empty filters', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
      };

      expect(ProblemFilterService.countActiveFilters(filter)).toBe(0);
    });

    it('should count all active filters', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
        tags: ['array'],
        difficulty: 'medium',
        status: 'unsolved',
        search: 'test',
      };

      expect(ProblemFilterService.countActiveFilters(filter)).toBe(4);
    });

    it('should not count pagination', () => {
      const filter: FilterState = {
        page: 5,
        limit: 50,
      };

      expect(ProblemFilterService.countActiveFilters(filter)).toBe(0);
    });
  });

  describe('validate', () => {
    it('should return valid for correct filters', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
        difficulty: 'easy',
        status: 'solved',
      };

      const result = ProblemFilterService.validate(filter);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject page less than 1', () => {
      const filter: FilterState = {
        page: 0,
        limit: 20,
      };

      const result = ProblemFilterService.validate(filter);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Page must be >= 1');
    });

    it('should reject limit outside valid range', () => {
      const filter1: FilterState = {
        page: 1,
        limit: 0,
      };

      const filter2: FilterState = {
        page: 1,
        limit: 101,
      };

      const result1 = ProblemFilterService.validate(filter1);
      const result2 = ProblemFilterService.validate(filter2);

      expect(result1.valid).toBe(false);
      expect(result2.valid).toBe(false);
      expect(result1.errors).toContain('Limit must be between 1 and 100');
    });

    it('should reject invalid difficulty', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
        difficulty: 'invalid' as any,
      };

      const result = ProblemFilterService.validate(filter);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid difficulty value');
    });

    it('should reject invalid status', () => {
      const filter: FilterState = {
        page: 1,
        limit: 20,
        status: 'invalid' as any,
      };

      const result = ProblemFilterService.validate(filter);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid status value');
    });
  });
});
