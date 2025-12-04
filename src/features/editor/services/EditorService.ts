/**
 * @file EditorService.ts
 * @description Editor business logic service - handles draft saving/loading with queuing
 *
 * @principles
 * - SRP: ✅ Single responsibility: editor draft management
 * - CQS: ✅ Commands (saveDraft) return Promise<void>, Queries (loadDraft) return data
 * - DIP: ✅ Depends on ISubmissionRepository interface
 * - Composition: ✅ Manages save queue and version tracking internally
 *
 * @responsibilities
 * - Draft save/load orchestration
 * - Save queue management (prevent race conditions)
 * - Version tracking for concurrent saves
 * - Error handling and retry logic
 *
 * @usage
 * ```typescript
 * const editorService = new EditorService(repositories.submission);
 * await editorService.saveDraft('problem-123', 'code', 'c');
 * const draft = await editorService.loadDraft('problem-123');
 * ```
 */

import { ISubmissionRepository } from '../../../shared/repositories/interfaces';

interface SaveQueueItem {
  problemId: string;
  code: string;
  language: string;
  version: number;
}

interface DraftData {
  code: string;
  language: string;
}

export class EditorService {
  private submissionRepository: ISubmissionRepository;
  private saveQueue = new Map<string, SaveQueueItem>();
  private activeSaves = new Map<string, Promise<void>>();
  private saveVersion = 0;

  constructor(submissionRepository: ISubmissionRepository) {
    this.submissionRepository = submissionRepository;
  }

  /**
   * Save draft code with queuing support
   * If a save is already in progress for this problem, queue it for later
   *
   * @param problemId - Problem identifier
   * @param code - Code to save
   * @param language - Programming language
   * @returns Promise that resolves when save completes
   */
  async saveDraft(problemId: string, code: string, language: string): Promise<void> {
    const currentVersion = ++this.saveVersion;

    // If already saving this problem, queue this save
    if (this.activeSaves.has(problemId)) {
      this.saveQueue.set(problemId, { problemId, code, language, version: currentVersion });
      // Wait for current save to complete, then process queue
      await this.activeSaves.get(problemId);
      return;
    }

    // Start new save
    const savePromise = this.executeSave(problemId, code, language, currentVersion);
    this.activeSaves.set(problemId, savePromise);

    try {
      await savePromise;
    } finally {
      this.activeSaves.delete(problemId);

      // Process queued save if exists and is newer
      const queued = this.saveQueue.get(problemId);
      if (queued && queued.version > currentVersion) {
        this.saveQueue.delete(problemId);
        // Execute queued save asynchronously (don't await)
        setTimeout(() => {
          this.saveDraft(queued.problemId, queued.code, queued.language);
        }, 0);
      }
    }
  }

  /**
   * Execute the actual save operation
   *
   * @private
   * @param problemId - Problem identifier
   * @param code - Code to save
   * @param language - Programming language
   * @param version - Save version for tracking
   */
  private async executeSave(
    problemId: string,
    code: string,
    language: string,
    version: number
  ): Promise<void> {
    try {
      await this.submissionRepository.saveDraft(problemId, { code, language });
    } catch (error) {
      console.error(`[EditorService] Failed to save draft (version ${version}):`, error);
      throw error;
    }
  }

  /**
   * Load draft code for a problem
   *
   * @param problemId - Problem identifier
   * @returns Draft data or null if not found
   */
  async loadDraft(problemId: string): Promise<DraftData | null> {
    try {
      const draft = await this.submissionRepository.getDraft(problemId);

      if (!draft) {
        return null;
      }

      return {
        code: draft.code,
        language: draft.language,
      };
    } catch (error) {
      console.error(`[EditorService] Failed to load draft:`, error);
      throw error;
    }
  }

  /**
   * Clear all pending saves (useful for cleanup)
   */
  clearQueue(): void {
    this.saveQueue.clear();
    this.saveVersion = 0;
  }

  /**
   * Check if there are pending saves for a problem
   *
   * @param problemId - Problem identifier
   * @returns true if save is in progress or queued
   */
  hasPendingSave(problemId: string): boolean {
    return this.activeSaves.has(problemId) || this.saveQueue.has(problemId);
  }
}
