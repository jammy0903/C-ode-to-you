/**
 * @file ProblemFilterService.ts
 * @description Problem filter service - handles filter logic extracted from Store
 * 
 * @principles
 * - SRP: ✅ Single responsibility: filter logic only (pure functions)
 * - CQS: ✅ All methods are Queries (return data, no side effects)
 * - DIP: ✅ No dependencies (pure functions)
 * - Composition: ✅ Composable filter operations
 * 
 * @functions (all static, pure)
 * - createEmptyFilter(): FilterState - Create initial empty filter
 * - mergeFilters(current, updates): FilterState - Merge filters (immutable)
 * - toApiParams(filter): GetProblemsParams - Convert to API params
 * - isEmpty(filter): boolean - Check if filter is empty
 * - clearFilters(filter): FilterState - Clear all filters
 * - addTag(filter, tag): FilterState - Add tag (immutable)
 * - removeTag(filter, tag): FilterState - Remove tag (immutable)
 * - toggleTag(filter, tag): FilterState - Toggle tag (immutable)
 * - setDifficulty(filter, difficulty): FilterState - Set difficulty (immutable)
 * - setStatus(filter, status): FilterState - Set status (immutable)
 * - setSearch(filter, search): FilterState - Set search query (immutable)
 * - nextPage(filter): FilterState - Increment page (immutable)
 * - setPage(filter, page): FilterState - Set page (immutable)
 * - getSummary(filter): string[] - Get filter summary for display
 * - countActiveFilters(filter): number - Count active filters
 * - validate(filter): ValidationResult - Validate filter parameters
 */

import { GetProblemsParams } from '../api/endpoints/problems.api';

export interface FilterState {
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  status?: 'solved' | 'attempted' | 'unsolved';
  search?: string;
  page?: number;
  limit?: number;
}

export class ProblemFilterService {
  /**
   * Create initial empty filter
   */
  static createEmptyFilter(): FilterState {
    return {
      page: 1,
      limit: 20,
    };
  }

  /**
   * Merge new filters with existing ones
   * Resets page to 1 when filters change
   */
  static mergeFilters(current: FilterState, updates: Partial<FilterState>): FilterState {
    const hasFilterChange =
      updates.tags !== undefined ||
      updates.difficulty !== undefined ||
      updates.status !== undefined ||
      updates.search !== undefined;

    return {
      ...current,
      ...updates,
      // Reset page to 1 if filter changes (not pagination)
      page: hasFilterChange && updates.page === undefined ? 1 : updates.page ?? current.page,
    };
  }

  /**
   * Convert FilterState to API params
   */
  static toApiParams(filter: FilterState): GetProblemsParams {
    return {
      page: filter.page,
      limit: filter.limit,
      tags: filter.tags?.join(','),
      difficulty: filter.difficulty,
      status: filter.status,
      q: filter.search,
    };
  }

  /**
   * Convert API params to FilterState
   */
  static fromApiParams(params: GetProblemsParams): FilterState {
    return {
      page: params.page,
      limit: params.limit,
      tags: params.tags?.split(',').filter(Boolean),
      difficulty: params.difficulty as FilterState['difficulty'],
      status: params.status,
      search: params.q,
    };
  }

  /**
   * Check if filter is empty (no active filters)
   */
  static isEmpty(filter: FilterState): boolean {
    return (
      !filter.tags?.length &&
      !filter.difficulty &&
      !filter.status &&
      !filter.search
    );
  }

  /**
   * Clear all filters except pagination
   */
  static clearFilters(filter: FilterState): FilterState {
    return {
      page: 1,
      limit: filter.limit,
    };
  }

  /**
   * Add a tag to existing tags
   */
  static addTag(filter: FilterState, tag: string): FilterState {
    const currentTags = filter.tags || [];
    if (currentTags.includes(tag)) {
      return filter; // Already exists
    }

    return {
      ...filter,
      tags: [...currentTags, tag],
      page: 1, // Reset page
    };
  }

  /**
   * Remove a tag from existing tags
   */
  static removeTag(filter: FilterState, tag: string): FilterState {
    const currentTags = filter.tags || [];
    const newTags = currentTags.filter((t) => t !== tag);

    return {
      ...filter,
      tags: newTags.length > 0 ? newTags : undefined,
      page: 1, // Reset page
    };
  }

  /**
   * Toggle tag (add if not exists, remove if exists)
   */
  static toggleTag(filter: FilterState, tag: string): FilterState {
    const currentTags = filter.tags || [];
    if (currentTags.includes(tag)) {
      return ProblemFilterService.removeTag(filter, tag);
    } else {
      return ProblemFilterService.addTag(filter, tag);
    }
  }

  /**
   * Set difficulty filter
   */
  static setDifficulty(
    filter: FilterState,
    difficulty: 'easy' | 'medium' | 'hard' | undefined
  ): FilterState {
    return {
      ...filter,
      difficulty,
      page: 1,
    };
  }

  /**
   * Set status filter
   */
  static setStatus(
    filter: FilterState,
    status: 'solved' | 'attempted' | 'unsolved' | undefined
  ): FilterState {
    return {
      ...filter,
      status,
      page: 1,
    };
  }

  /**
   * Set search query
   */
  static setSearch(filter: FilterState, search: string | undefined): FilterState {
    return {
      ...filter,
      search: search?.trim() || undefined,
      page: 1,
    };
  }

  /**
   * Increment page for pagination
   */
  static nextPage(filter: FilterState): FilterState {
    return {
      ...filter,
      page: (filter.page || 1) + 1,
    };
  }

  /**
   * Set specific page
   */
  static setPage(filter: FilterState, page: number): FilterState {
    return {
      ...filter,
      page: Math.max(1, page),
    };
  }

  /**
   * Get filter summary for display
   */
  static getSummary(filter: FilterState): string[] {
    const summary: string[] = [];

    if (filter.tags?.length) {
      summary.push(`Tags: ${filter.tags.join(', ')}`);
    }

    if (filter.difficulty) {
      summary.push(`Difficulty: ${filter.difficulty}`);
    }

    if (filter.status) {
      summary.push(`Status: ${filter.status}`);
    }

    if (filter.search) {
      summary.push(`Search: "${filter.search}"`);
    }

    return summary;
  }

  /**
   * Count active filters
   */
  static countActiveFilters(filter: FilterState): number {
    let count = 0;

    if (filter.tags?.length) count++;
    if (filter.difficulty) count++;
    if (filter.status) count++;
    if (filter.search) count++;

    return count;
  }

  /**
   * Validate filter parameters
   */
  static validate(filter: FilterState): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate page
    if (filter.page !== undefined && filter.page < 1) {
      errors.push('Page must be >= 1');
    }

    // Validate limit
    if (filter.limit !== undefined && (filter.limit < 1 || filter.limit > 100)) {
      errors.push('Limit must be between 1 and 100');
    }

    // Validate difficulty
    if (filter.difficulty && !['easy', 'medium', 'hard'].includes(filter.difficulty)) {
      errors.push('Invalid difficulty value');
    }

    // Validate status
    if (filter.status && !['solved', 'attempted', 'unsolved'].includes(filter.status)) {
      errors.push('Invalid status value');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
