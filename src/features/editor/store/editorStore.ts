/**
 * @file editorStore.ts
 * @description Code editor state management store
 *
 * @principles
 * - SRP: ✅ Manages ONLY editor state (code, language, draft status)
 * - CQS: ✅ Commands (setters) mutate state, Queries (getters) return data
 * - DIP: ✅ No dependencies - pure state management
 * - Composition: ✅ Used by hooks that compose with EditorService
 *
 * @functions
 * - setCode(code: string): void - Update code and mark as dirty (pure state mutation)
 * - setLanguage(lang: string): void - Update language and mark as dirty (pure state mutation)
 * - setSaving(isSaving: boolean): void - Update saving status (pure state mutation)
 * - markSaved(timestamp: string): void - Mark draft as saved (pure state mutation)
 * - setDraft(code: string, language: string): void - Load draft data (pure state mutation)
 * - reset(): void - Reset editor state (pure state mutation)
 *
 * @state
 * - code: string - Current editor code
 * - language: string - Current language (default: 'c')
 * - isDirty: boolean - Whether code has unsaved changes
 * - isSaving: boolean - Draft save in progress
 * - lastSavedAt: string | null - ISO timestamp of last save
 *
 * @note
 * All business logic (save queuing, version management, API calls) has been moved to EditorService.
 * This store only manages state - Hook layer orchestrates Service + Store.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// C언어 기본 템플릿
const C_TEMPLATE = `#include <stdio.h>

int main() {
    // 여기에 코드를 작성하세요

    return 0;
}
`;

interface EditorState {
  code: string;
  language: string;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
}

interface EditorActions {
  setCode: (code: string) => void;
  setLanguage: (lang: string) => void;
  setSaving: (isSaving: boolean) => void;
  markSaved: (timestamp: string) => void;
  setDraft: (code: string, language: string) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState & EditorActions>()(
  immer((set) => ({
    // State
    code: C_TEMPLATE, // C언어 기본 템플릿으로 시작
    language: 'c', // Default to C
    isDirty: false,
    isSaving: false,
    lastSavedAt: null,

    // Actions - Pure state mutations only
    setCode: (code) => {
      set({ code, isDirty: true });
    },

    setLanguage: (language) => {
      set({ language, isDirty: true });
    },

    setSaving: (isSaving) => {
      set({ isSaving });
    },

    markSaved: (timestamp) => {
      set({ isDirty: false, lastSavedAt: timestamp, isSaving: false });
    },

    setDraft: (code, language) => {
      set({ code, language, isDirty: false });
    },

    reset: () => {
      set({
        code: C_TEMPLATE, // 리셋 시에도 기본 템플릿으로
        language: 'c',
        isDirty: false,
        isSaving: false,
        lastSavedAt: null,
      });
    },
  }))
);
