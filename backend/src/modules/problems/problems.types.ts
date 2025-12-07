import { Problem, ProblemFunction } from '@prisma/client';

export interface ProblemWithFunctions extends Problem {
  functions: ProblemFunction[];
}

export interface ProblemListItem {
  id: string;
  number: number;
  title: string;
  difficulty: string;
  tags: string[];
  acceptedCount: number;
  submissionCount: number;
  userStatus?: 'unsolved' | 'attempted' | 'solved';
  userAttempts?: number;
  lastAttemptAt?: Date;
}

export interface ProblemFilters {
  page?: number;
  limit?: number;
  tags?: string;
  // Baekjoon tier string like bronze_5, silver_3, gold_1, etc.
  difficulty?: string;
  status?: 'unsolved' | 'attempted' | 'solved';
}

export interface FunctionApproach {
  name: string;
  description: string;
  functions: {
    name: string;
    header: string | null;
    description: string;
    example: string | null;
  }[];
}
