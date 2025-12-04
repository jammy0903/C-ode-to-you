/**
 * @file useCodeEditor.ts
 * @description Code editor hook - orchestrates EditorService + editorStore with auto-save
 *
 * @principles
 * - SRP: ✅ Single responsibility: orchestrate editor state + service for auto-save
 * - CQS: ✅ Queries (code, language) return data, Commands (setCode, saveDraft) mutate
 * - DIP: ✅ Depends on editorStore and EditorService abstractions
 * - Composition: ✅ Composes Store (state) + Service (logic) + useDebounce + useEffect
 *
 * @architecture
 * Hook → EditorService (business logic) + editorStore (state)
 *
 * @functions
 * - useCodeEditor(problemId?: string): CodeEditorHookReturn - Hook that returns editor state and actions
 *
 * @returns
 * - code: string - Current code
 * - language: string - Current language
 * - setCode(code: string): void - Update code
 * - setLanguage(lang: string): void - Update language
 * - saveDraft(): Promise<void> - Save draft manually
 * - isDirty: boolean - Has unsaved changes
 * - isSaving: boolean - Save in progress
 * - lastSavedAt: string | null - Last save timestamp
 *
 * @note
 * This hook demonstrates Phase 2.2 architecture:
 * - Store: Pure state management (editorStore)
 * - Service: Business logic (EditorService)
 * - Hook: Orchestration layer (this file)
 */

import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useEditorStore } from '../store/editorStore';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { EditorService } from '../services/EditorService';
import { repositories } from '../../../shared/repositories';
import {
  selectEditorState,
  selectEditorActions,
} from '../store/editorSelectors';

export const useCodeEditor = (problemId?: string) => {
  // Use selectors for optimal re-rendering
  const state = useEditorStore(useShallow(selectEditorState));
  const actions = useEditorStore(useShallow(selectEditorActions));

  // Create EditorService instance (memoized)
  const editorService = useMemo(() => new EditorService(repositories.submission), []);

  // Auto-load draft when problemId changes
  useEffect(() => {
    if (!problemId) return;

    const loadDraft = async () => {
      try {
        const draft = await editorService.loadDraft(problemId);
        if (draft) {
          actions.setDraft(draft.code, draft.language);
        }
      } catch (error) {
        console.error('[useCodeEditor] Failed to load draft:', error);
      }
    };

    loadDraft();

    // Cleanup: reset store when problem changes
    return () => {
      actions.reset();
    };
  }, [problemId, editorService, actions]);

  // Auto-save draft when code changes (debounced)
  const debouncedCode = useDebounce(state.code, 2000); // Save every 2 seconds of inactivity

  useEffect(() => {
    if (!problemId || !state.isDirty || !debouncedCode) return;

    const saveDraft = async () => {
      actions.setSaving(true);

      try {
        await editorService.saveDraft(problemId, state.code, state.language);
        actions.markSaved(new Date().toISOString());
      } catch (error) {
        console.error('[useCodeEditor] Failed to auto-save draft:', error);
        actions.setSaving(false);
      }
    };

    saveDraft();
  }, [debouncedCode, problemId, editorService, state, actions]);

  // Manual save function
  const saveDraft = async () => {
    if (!problemId) return;

    actions.setSaving(true);

    try {
      await editorService.saveDraft(problemId, state.code, state.language);
      actions.markSaved(new Date().toISOString());
    } catch (error) {
      console.error('[useCodeEditor] Failed to save draft:', error);
      actions.setSaving(false);
      throw error;
    }
  };

  return {
    code: state.code,
    language: state.language,
    setCode: actions.setCode,
    setLanguage: actions.setLanguage,
    saveDraft,
    isDirty: state.isDirty,
    isSaving: state.isSaving,
    lastSavedAt: state.lastSavedAt,
  };
};
