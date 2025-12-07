// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// Query filters
export interface ProblemFilters extends PaginationParams {
  tags?: string;
  // Baekjoon tier string like bronze_5, silver_3, gold_1, etc.
  difficulty?: string;
  status?: 'unsolved' | 'attempted' | 'solved';
}

// Error types
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async handler
export type AsyncHandler = (
  req: any,
  res: any,
  next: any
) => Promise<any>;
