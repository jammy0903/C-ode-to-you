/**
 * @file editorSelectors.ts
 * @description Memoized selectors for editorStore
 *
 * @principles
 * - Performance: ✅ Selectors prevent unnecessary re-renders
 * - SRP: ✅ Each selector has a single purpose
 * - Reusability: ✅ Selectors can be shared across components/hooks
 */

import { useEditorStore } from './editorStore';

type EditorState = ReturnType<typeof useEditorStore.getState>;

// ==================== State Selectors ====================

/** Select current code */
export const selectCode = (state: EditorState) => state.code;

/** Select current language */
export const selectLanguage = (state: EditorState) => state.language;

/** Select dirty state (has unsaved changes) */
export const selectIsDirty = (state: EditorState) => state.isDirty;

/** Select saving state */
export const selectIsSaving = (state: EditorState) => state.isSaving;

/** Select last saved timestamp */
export const selectLastSavedAt = (state: EditorState) => state.lastSavedAt;

/** Combined editor state for components that need multiple values */
export const selectEditorState = (state: EditorState) => ({
  code: state.code,
  language: state.language,
  isDirty: state.isDirty,
  isSaving: state.isSaving,
  lastSavedAt: state.lastSavedAt,
});

// ==================== Action Selectors ====================

/** Select store actions (stable references) */
export const selectEditorActions = (state: EditorState) => ({
  setCode: state.setCode,
  setLanguage: state.setLanguage,
  setSaving: state.setSaving,
  markSaved: state.markSaved,
  setDraft: state.setDraft,
  reset: state.reset,
});
