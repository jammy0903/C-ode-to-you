import { HttpClient } from '../utils/http';
import { Submission, SubmitCodeRequest, PaginatedResponse } from '../types';

export class SubmissionsModule {
  constructor(private http: HttpClient) {}

  /**
   * Submit code for a problem
   */
  async submit(problemId: string, request: SubmitCodeRequest): Promise<Submission> {
    return this.http.post<Submission>(`/api/submissions/${problemId}`, request);
  }

  /**
   * Get submission result by ID
   */
  async get(submissionId: string): Promise<Submission> {
    return this.http.get<Submission>(`/api/submissions/${submissionId}`);
  }

  /**
   * List submissions for a problem
   */
  async listByProblem(problemId: string): Promise<Submission[]> {
    return this.http.get<Submission[]>(`/api/submissions/problem/${problemId}`);
  }

  /**
   * List all submissions for the current user
   */
  async listMy(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Submission>> {
    const query: Record<string, string> = {};
    if (params?.page) query.page = String(params.page);
    if (params?.limit) query.limit = String(params.limit);

    return this.http.get<PaginatedResponse<Submission>>('/api/submissions/my', query);
  }

  /**
   * Get code draft for a problem
   */
  async getDraft(problemId: string): Promise<{ code: string }> {
    return this.http.get<{ code: string }>(`/api/submissions/${problemId}/draft`);
  }

  /**
   * Save code draft for a problem
   */
  async saveDraft(problemId: string, code: string): Promise<void> {
    await this.http.put(`/api/submissions/${problemId}/draft`, { code });
  }
}
