import { apiClient } from '../client';
import { ApiError } from '../core/types';
import { PaginatedData, Submission } from '../../types/api.types';

export interface SubmitCodePayload {
  code: string;
  language: string;
}

export interface SaveDraftPayload {
  code: string;
  language: string;
}

export interface SubmissionHistoryParams {
  page?: number;
  limit?: number;
  problemId?: string;
}

interface ValidateCodeResponse {
  valid: boolean;
  message?: string;
}

/**
 * Submissions API endpoints
 * Refactored to use ApiClient for consistent response handling
 */
export const submissionsApi = {
  /**
   * Submit Code
   * POST /api/submissions/:problemId/submit
   */
  submitCode: async (problemId: string, payload: SubmitCodePayload): Promise<Submission> => {
    return apiClient.post<Submission>(`/submissions/${problemId}/submit`, payload);
  },

  /**
   * Get Submission Status
   * GET /api/submissions/:submissionId/status
   */
  getSubmissionStatus: async (submissionId: string): Promise<Submission> => {
    return apiClient.get<Submission>(`/submissions/${submissionId}/status`);
  },

  /**
   * Get My Last Submission
   * GET /api/submissions/:problemId/my-last
   * Returns null if no submission exists
   */
  getMyLastSubmission: async (problemId: string): Promise<Submission | null> => {
    try {
      return await apiClient.get<Submission>(`/submissions/${problemId}/my-last`);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get Problem Attempts
   * GET /api/submissions/:problemId/attempts
   */
  getProblemAttempts: async (problemId: string): Promise<Submission[]> => {
    return apiClient.get<Submission[]>(`/submissions/${problemId}/attempts`);
  },

  /**
   * Save Draft
   * POST /api/submissions/:problemId/draft
   */
  saveDraft: async (problemId: string, payload: SaveDraftPayload): Promise<void> => {
    await apiClient.post<void>(`/submissions/${problemId}/draft`, payload);
  },

  /**
   * Get Draft
   * GET /api/submissions/:problemId/draft
   * Returns null if no draft exists
   */
  getDraft: async (problemId: string): Promise<SaveDraftPayload | null> => {
    try {
      return await apiClient.get<SaveDraftPayload>(`/submissions/${problemId}/draft`);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Delete Draft
   * DELETE /api/submissions/:problemId/draft
   */
  deleteDraft: async (problemId: string): Promise<void> => {
    await apiClient.delete<void>(`/submissions/${problemId}/draft`);
  },

  /**
   * Get Submission Detail
   * GET /api/submissions/:submissionId
   */
  getSubmissionDetail: async (submissionId: string): Promise<Submission> => {
    return apiClient.get<Submission>(`/submissions/${submissionId}`);
  },

  /**
   * Get My Submissions (User's Submission History)
   * GET /api/submissions/my
   */
  getMySubmissions: async (params?: SubmissionHistoryParams): Promise<PaginatedData<Submission>> => {
    return apiClient.get<PaginatedData<Submission>>('/submissions/my', params as Record<string, unknown>);
  },

  /**
   * Get Wrong Submissions (Wrong Answer Notes)
   * GET /api/submissions/wrong
   */
  getWrongSubmissions: async (params?: SubmissionHistoryParams): Promise<PaginatedData<Submission>> => {
    return apiClient.get<PaginatedData<Submission>>('/submissions/wrong', params as Record<string, unknown>);
  },

  /**
   * Get Submission History
   * GET /api/submissions/history
   */
  getSubmissionHistory: async (params?: SubmissionHistoryParams): Promise<PaginatedData<Submission>> => {
    return apiClient.get<PaginatedData<Submission>>('/submissions/history', params as Record<string, unknown>);
  },

  /**
   * Validate Code (Quick Compile Check)
   * POST /api/submissions/validate
   */
  validateCode: async (payload: SubmitCodePayload): Promise<ValidateCodeResponse> => {
    return apiClient.post<ValidateCodeResponse>('/submissions/validate', payload);
  },
};

