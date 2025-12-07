/**
 * @file solvedac.types.ts
 * @description Type definitions for solved.ac API responses
 *
 * @apiReference https://solvedac.github.io/unofficial-documentation/
 */

/**
 * solved.ac Problem Tag
 */
export interface SolvedacTag {
  key: string;
  displayNames: Array<{
    language: string;
    name: string;
  }>;
  aliases?: string[];
  problemCount?: number;
}

/**
 * solved.ac Problem Detail
 */
export interface SolvedacProblem {
  problemId: number;
  titleKo: string;
  titles: Array<{
    language: string;
    languageDisplayName: string;
    title: string;
    isOriginal: boolean;
  }>;
  level: number;  // 1-30 (0 = unrated)
  solvable: boolean;
  averageTries: number;
  acceptedUserCount: number;
  submissionCount?: number;
  votedUserCount: number;
  isLevelLocked: boolean;
  sprout: boolean;
  givesNoRating: boolean;
  isPartial: boolean;
  tags: SolvedacTag[];
}

/**
 * solved.ac Search Result
 */
export interface SolvedacSearchResult {
  count: number;  // Total number of results
  items: SolvedacProblem[];
}

/**
 * Level to Tier mapping
 *
 * Level 0: unrated
 * Level 1-5: bronze_5 ~ bronze_1
 * Level 6-10: silver_5 ~ silver_1
 * Level 11-15: gold_5 ~ gold_1
 * Level 16-20: platinum_5 ~ platinum_1
 * Level 21-25: diamond_5 ~ diamond_1
 * Level 26-30: ruby_5 ~ ruby_1
 */
export type TierName = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'ruby' | 'unrated';
export type TierLevel = '5' | '4' | '3' | '2' | '1';
export type DifficultyTier = `${TierName}_${TierLevel}` | 'unrated';

/**
 * Tier query string for solved.ac API
 * Examples: 'b5', 's1', 'g3'
 */
export type TierQuery = string;
