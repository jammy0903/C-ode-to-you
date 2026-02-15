import { HttpClient } from '../utils/http';
import { Problem, ProblemListParams, ProblemFunction, PaginatedResponse } from '../types';

export class ProblemsModule {
  constructor(private http: HttpClient) {}

  /**
   * List problems with optional filtering and pagination
   */
  async list(params?: ProblemListParams): Promise<PaginatedResponse<Problem>> {
    const query: Record<string, string> = {};
    if (params?.page) query.page = String(params.page);
    if (params?.limit) query.limit = String(params.limit);
    if (params?.difficulty) query.difficulty = params.difficulty;
    if (params?.tags) query.tags = params.tags;
    if (params?.status) query.status = params.status;

    return this.http.get<PaginatedResponse<Problem>>('/api/problems', query);
  }

  /**
   * Get a single problem by ID
   */
  async get(problemId: string): Promise<Problem> {
    return this.http.get<Problem>(`/api/problems/${problemId}`);
  }

  /**
   * Get problems by tag
   */
  async getByTag(tag: string): Promise<Problem[]> {
    return this.http.get<Problem[]>(`/api/problems/tag/${tag}`);
  }

  /**
   * Get all available tags
   */
  async getTags(): Promise<string[]> {
    return this.http.get<string[]>('/api/problems/tags');
  }

  /**
   * Get related C functions for a problem
   */
  async getFunctions(problemId: string): Promise<ProblemFunction[]> {
    return this.http.get<ProblemFunction[]>(`/api/problems/${problemId}/functions`);
  }
}
