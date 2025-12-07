# Frontend Refactoring Plan

## 📋 Overview

**Status:** Planning
**Priority:** High
**Estimated Duration:** 2-3 weeks
**Date Created:** 2025-12-04

### Problem Statement

현재 프론트엔드 코드베이스는 SOLID 및 DRY 원칙을 심각하게 위반하고 있습니다:
- 중복 코드가 코드베이스의 60% 이상 차지
- Store가 모든 책임을 담당 (SRP 위반)
- 추상화 레이어 전무 (DIP 위반)
- 확장 불가능한 구조 (OCP 위반)
- 테스트 불가능

### Goals

1. **DRY 원칙 준수**: 중복 코드 90% 이상 제거
2. **SOLID 원칙 적용**: 각 모듈의 명확한 책임 분리
3. **테스트 가능성**: 80% 이상 테스트 커버리지 목표
4. **확장성**: 새 기능 추가 시 기존 코드 수정 최소화
5. **타입 안정성**: `any` 타입 완전 제거

---

## 🎯 Phase 1: Foundation Layer (Week 1)

### 1.1 API Response Abstraction

**Priority:** 🔴 Critical
**Files to Create:**
- `frontend/src/shared/api/core/apiClient.ts`
- `frontend/src/shared/api/core/types.ts`

**Implementation:**

```typescript
// frontend/src/shared/api/core/types.ts
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

export interface RequestConfig<T = any> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: T;
  params?: Record<string, any>;
}

// frontend/src/shared/api/core/apiClient.ts
import { AxiosInstance } from 'axios';
import { ApiResponse } from '../../types/api.types';

export class ApiClient {
  constructor(private axiosInstance: AxiosInstance) {}

  /**
   * Unwrap API response and handle errors uniformly
   */
  async request<T>(config: RequestConfig): Promise<T> {
    const response = await this.axiosInstance.request<ApiResponse<T>>(config);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Invalid API response');
    }

    return response.data.data;
  }

  get<T>(url: string, params?: any): Promise<T> {
    return this.request<T>({ method: 'GET', url, params });
  }

  post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'POST', url, data });
  }

  put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data });
  }

  delete<T>(url: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', url });
  }
}

export const apiClient = new ApiClient(client);
```

**Tasks:**
- [ ] Create `ApiClient` class
- [ ] Migrate `problemsApi` to use `ApiClient`
- [ ] Migrate `submissionsApi` to use `ApiClient`
- [ ] Migrate `usersApi` to use `ApiClient`
- [ ] Migrate `authApi` to use `ApiClient`
- [ ] Migrate `aiApi` to use `ApiClient`
- [ ] Migrate `githubApi` to use `ApiClient`
- [ ] Remove all `response.data.data!` occurrences
- [ ] Update tests

**Expected Result:**
- 30+ duplicate unwrapping code removed
- Consistent error handling
- Type-safe API calls

---

### 1.2 Async State Management Abstraction

**Priority:** 🔴 Critical
**Files to Create:**
- `frontend/src/shared/state/asyncState.ts`
- `frontend/src/shared/state/createAsyncSlice.ts`

**Implementation:**

```typescript
// frontend/src/shared/state/asyncState.ts
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

export const createAsyncState = <T>(initialData: T | null = null): AsyncState<T> => ({
  data: initialData,
  isLoading: false,
  isRefreshing: false,
  error: null,
});

export const asyncStateReducers = {
  setLoading: <T>(state: AsyncState<T>) => {
    state.isLoading = true;
    state.error = null;
  },

  setRefreshing: <T>(state: AsyncState<T>) => {
    state.isRefreshing = true;
    state.error = null;
  },

  setSuccess: <T>(state: AsyncState<T>, data: T) => {
    state.data = data;
    state.isLoading = false;
    state.isRefreshing = false;
    state.error = null;
  },

  setError: <T>(state: AsyncState<T>, error: string) => {
    state.error = error;
    state.isLoading = false;
    state.isRefreshing = false;
  },
};

// frontend/src/shared/state/createAsyncSlice.ts
import { getErrorMessage } from '../utils/error';

interface AsyncActionOptions<T, Args extends any[]> {
  name: string;
  action: (...args: Args) => Promise<T>;
  onStart?: (state: any, ...args: Args) => void;
  onSuccess?: (state: any, result: T) => void;
  onError?: (state: any, error: Error) => void;
}

export function createAsyncAction<T, Args extends any[]>(
  options: AsyncActionOptions<T, Args>
) {
  return async (set: any, get: any, ...args: Args): Promise<T> => {
    try {
      // Start
      set((state: any) => {
        state.isLoading = true;
        state.error = null;
        options.onStart?.(state, ...args);
      });

      // Execute
      const result = await options.action(...args);

      // Success
      set((state: any) => {
        state.isLoading = false;
        options.onSuccess?.(state, result);
      });

      return result;
    } catch (error) {
      // Error
      const errorMessage = getErrorMessage(error, `Failed to ${options.name}`);

      set((state: any) => {
        state.isLoading = false;
        state.error = errorMessage;
        options.onError?.(state, error as Error);
      });

      throw error;
    }
  };
}
```

**Tasks:**
- [ ] Create `AsyncState<T>` interface
- [ ] Create `createAsyncState` factory
- [ ] Create `createAsyncAction` helper
- [ ] Migrate `submissionStore` to use async helpers
- [ ] Migrate `problemStore` to use async helpers
- [ ] Migrate `userStore` to use async helpers
- [ ] Migrate `chatStore` to use async helpers
- [ ] Remove all duplicate error handling code
- [ ] Update tests

**Expected Result:**
- 20+ duplicate error handling removed
- Consistent loading/error states
- Reusable async action pattern

---

### 1.3 Repository Pattern Implementation

**Priority:** 🟡 High
**Files to Create:**
- `frontend/src/shared/repositories/interfaces/`
  - `IProblemRepository.ts`
  - `ISubmissionRepository.ts`
  - `IUserRepository.ts`
- `frontend/src/shared/repositories/impl/`
  - `ApiProblemRepository.ts`
  - `ApiSubmissionRepository.ts`
  - `ApiUserRepository.ts`

**Implementation:**

```typescript
// frontend/src/shared/repositories/interfaces/IProblemRepository.ts
import { Problem, PaginatedData } from '../../types/api.types';
import { GetProblemsParams } from '../../api/endpoints/problems.api';

export interface IProblemRepository {
  getProblems(params?: GetProblemsParams): Promise<PaginatedData<Problem>>;
  getProblemDetail(id: string): Promise<Problem>;
  searchProblems(query: string): Promise<PaginatedData<Problem>>;
  getProblemStats(): Promise<any>;
  getRecommendedFunctions(id: string): Promise<any[]>;
}

// frontend/src/shared/repositories/impl/ApiProblemRepository.ts
import { apiClient } from '../../api/core/apiClient';
import { IProblemRepository } from '../interfaces/IProblemRepository';

export class ApiProblemRepository implements IProblemRepository {
  async getProblems(params?: GetProblemsParams) {
    return apiClient.get<{ problems: Problem[]; pagination: any }>('/problems', params)
      .then(data => ({ items: data.problems, pagination: data.pagination }));
  }

  async getProblemDetail(id: string) {
    return apiClient.get<Problem>(`/problems/${id}`);
  }

  async searchProblems(query: string) {
    return apiClient.get<{ problems: Problem[]; pagination: any }>('/problems/search', { q: query })
      .then(data => ({ items: data.problems, pagination: data.pagination }));
  }

  async getProblemStats() {
    return apiClient.get('/problems/stats');
  }

  async getRecommendedFunctions(id: string) {
    return apiClient.get<any[]>(`/problems/${id}/functions`);
  }
}

// Create singleton instance
export const problemRepository = new ApiProblemRepository();
```

**Tasks:**
- [ ] Define repository interfaces for all domains
- [ ] Implement API-based repositories
- [ ] Create dependency injection system
- [ ] Update stores to use repositories
- [ ] Create mock repositories for testing
- [ ] Update tests to use mock repositories

**Expected Result:**
- Clear separation: Store ← Repository ← API
- Testable business logic
- Easy to swap implementations

---

## 🎯 Phase 2: Business Logic Separation (Week 2)

### 2.1 Domain Services Layer

**Priority:** 🟡 High
**Files to Create:**
- `frontend/src/domains/submission/`
  - `SubmissionService.ts`
  - `SubmissionPollingService.ts`
  - `types.ts`
- `frontend/src/domains/problem/`
  - `ProblemService.ts`
  - `ProblemFilterService.ts`
  - `types.ts`

**Implementation:**

```typescript
// frontend/src/domains/submission/SubmissionPollingService.ts
export class SubmissionPollingService {
  private pollInterval: NodeJS.Timeout | null = null;
  private readonly POLL_INTERVAL_MS = 2000;

  constructor(
    private getStatus: (id: string) => Promise<Submission>,
    private onUpdate: (submission: Submission) => void,
    private onComplete: (submission: Submission) => void
  ) {}

  start(submissionId: string) {
    this.stop();

    this.pollInterval = setInterval(async () => {
      try {
        const submission = await this.getStatus(submissionId);
        this.onUpdate(submission);

        if (this.isFinalStatus(submission.status)) {
          this.onComplete(submission);
          this.stop();
        }
      } catch (error) {
        console.error('Polling failed:', error);
      }
    }, this.POLL_INTERVAL_MS);
  }

  stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private isFinalStatus(status: string): boolean {
    return ['accepted', 'wrong_answer', 'compile_error',
            'runtime_error', 'time_limit', 'memory_limit'].includes(status);
  }
}

// Usage in hook
export const useSubmissionPolling = (repository: ISubmissionRepository) => {
  const serviceRef = useRef<SubmissionPollingService | null>(null);

  const startPolling = useCallback((submissionId: string, onUpdate, onComplete) => {
    serviceRef.current = new SubmissionPollingService(
      (id) => repository.getSubmissionStatus(id),
      onUpdate,
      onComplete
    );
    serviceRef.current.start(submissionId);
  }, [repository]);

  const stopPolling = useCallback(() => {
    serviceRef.current?.stop();
  }, []);

  useEffect(() => {
    return () => serviceRef.current?.stop();
  }, []);

  return { startPolling, stopPolling };
};
```

**Tasks:**
- [ ] Extract polling logic to `SubmissionPollingService`
- [ ] Extract filter logic to `ProblemFilterService`
- [ ] Extract validation logic to domain services
- [ ] Create custom hooks for services
- [ ] Update stores to use services
- [ ] Remove business logic from stores
- [ ] Update tests

**Expected Result:**
- Clear business logic separation
- Reusable services
- Testable domain logic

---

### 2.2 Store Responsibility Reduction

**Priority:** 🟡 High
**Files to Refactor:**
- All stores in `frontend/src/features/*/store/`

**Before:**
```typescript
// Store doing everything
export const useSubmissionStore = create((set) => ({
  // State
  currentSubmission: null,
  // API calls
  submitCode: async () => { await api.submit() },
  // Polling logic
  pollStatus: async () => { /* complex logic */ },
  // History management
  fetchHistory: async () => { await api.getHistory() },
}));
```

**After:**
```typescript
// Store only manages state
export const useSubmissionStore = create((set) => ({
  // State only
  currentSubmission: null,
  isSubmitting: false,
  error: null,

  // Pure setters
  setCurrentSubmission: (submission) => set({ currentSubmission: submission }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setError: (error) => set({ error }),
}));

// Business logic in hook + service
export const useSubmission = (problemId: string) => {
  const store = useSubmissionStore();
  const repository = useSubmissionRepository();
  const pollingService = useSubmissionPolling(repository);

  const submitCode = async (code: string, language: string) => {
    store.setSubmitting(true);
    try {
      const submission = await repository.submitCode(problemId, { code, language });
      store.setCurrentSubmission(submission);

      // Start polling
      pollingService.startPolling(
        submission.id,
        (s) => store.setCurrentSubmission(s),
        (s) => {
          store.setCurrentSubmission(s);
          store.setSubmitting(false);
        }
      );

      return submission.id;
    } catch (error) {
      store.setError(getErrorMessage(error));
      store.setSubmitting(false);
      throw error;
    }
  };

  return { submitCode, ...store };
};
```

**Tasks:**
- [ ] Refactor `submissionStore` - state only
- [ ] Refactor `problemStore` - state only
- [ ] Refactor `userStore` - state only
- [ ] Refactor `chatStore` - state only
- [ ] Move logic to hooks + services
- [ ] Update components to use new hooks
- [ ] Update tests

**Expected Result:**
- Stores: 50% code reduction
- Clear SRP compliance
- Better testability

---

## 🎯 Phase 3: Advanced Patterns (Week 3)

### 3.1 Plugin System for Extensibility

**Priority:** 🟢 Medium
**Files to Create:**
- `frontend/src/shared/state/plugins/`
  - `StorePlugin.ts`
  - `createPluggableStore.ts`

**Implementation:**

```typescript
// frontend/src/shared/state/plugins/StorePlugin.ts
export interface StorePlugin<S, A> {
  name: string;
  extendState?: () => Partial<S>;
  extendActions?: (set: any, get: any) => Partial<A>;
  onInit?: (store: S & A) => void;
}

// frontend/src/shared/state/plugins/createPluggableStore.ts
export function createPluggableStore<S, A>(
  baseState: S,
  baseActions: (set: any, get: any) => A,
  plugins: StorePlugin<S, A>[] = []
) {
  return create<S & A>()(
    immer((set, get) => {
      // Merge plugin states
      const extendedState = plugins.reduce((acc, plugin) => ({
        ...acc,
        ...(plugin.extendState?.() || {}),
      }), baseState);

      // Merge plugin actions
      const extendedActions = plugins.reduce((acc, plugin) => ({
        ...acc,
        ...(plugin.extendActions?.(set, get) || {}),
      }), baseActions(set, get));

      const store = { ...extendedState, ...extendedActions };

      // Initialize plugins
      plugins.forEach(plugin => plugin.onInit?.(store));

      return store;
    })
  );
}

// Usage example: Bookmark plugin
const bookmarkPlugin: StorePlugin<ProblemState, ProblemActions> = {
  name: 'bookmark',
  extendState: () => ({
    bookmarkedProblems: new Set<string>(),
  }),
  extendActions: (set, get) => ({
    toggleBookmark: (id: string) => {
      set((state) => {
        if (state.bookmarkedProblems.has(id)) {
          state.bookmarkedProblems.delete(id);
        } else {
          state.bookmarkedProblems.add(id);
        }
      });
    },
    isBookmarked: (id: string) => {
      return get().bookmarkedProblems.has(id);
    },
  }),
};

// Create store with plugin
export const useProblemStore = createPluggableStore(
  baseState,
  baseActions,
  [bookmarkPlugin]
);
```

**Tasks:**
- [ ] Create plugin system architecture
- [ ] Implement `createPluggableStore`
- [ ] Create example plugins (bookmark, favorites)
- [ ] Document plugin API
- [ ] Update tests

**Expected Result:**
- Extensible stores without modification
- Plugin-based feature additions
- OCP compliance

---

### 3.2 Selector Pattern & Performance

**Priority:** 🟢 Medium
**Files to Create:**
- `frontend/src/shared/state/selectors/`
  - `createSelector.ts`
  - `problemSelectors.ts`

**Implementation:**

```typescript
// frontend/src/shared/state/selectors/problemSelectors.ts
import { useProblemStore } from '../../features/problems/store/problemStore';

// Efficient selectors
export const useProblemList = () =>
  useProblemStore((state) => state.problems);

export const useProblemById = (id: string) =>
  useProblemStore((state) => state.problemDetails[id]);

export const useFilteredProblems = (difficulty?: string) =>
  useProblemStore((state) => {
    if (!difficulty) return state.problems;
    return state.problems.filter(p => p.difficulty === difficulty);
  });

// Prevent unnecessary re-renders
export const useProblemListActions = () =>
  useProblemStore((state) => ({
    fetchProblems: state.fetchProblems,
    setFilters: state.setFilters,
  }));
```

**Tasks:**
- [ ] Create selector utilities
- [ ] Implement selectors for all stores
- [ ] Update components to use selectors
- [ ] Add React DevTools Profiler checks
- [ ] Measure performance improvements
- [ ] Update tests

**Expected Result:**
- 50% reduction in unnecessary re-renders
- Better performance
- Cleaner component code

---

### 3.3 Type Safety Improvements

**Priority:** 🟢 Medium
**Files to Update:**
- All files using `any`

**Tasks:**
- [ ] Find all `any` types: `grep -r "any" --include="*.ts" --include="*.tsx"`
- [ ] Replace `error: any` with proper error types
- [ ] Create `ApiError` class for typed errors
- [ ] Add strict TypeScript config
- [ ] Enable `noImplicitAny`
- [ ] Enable `strictNullChecks`
- [ ] Fix all type errors
- [ ] Update tests

**Expected Result:**
- Zero `any` types
- Complete type safety
- Compile-time error prevention

---

## 📊 Success Metrics

### Code Quality Metrics

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| Duplicate Code | 60% | <10% | SonarQube |
| Test Coverage | 0% | >80% | Jest |
| Type Safety | 70% (`any` usage) | 100% | TypeScript strict mode |
| Cyclomatic Complexity | >20 | <10 | ESLint complexity rule |
| Bundle Size | N/A | Track & reduce | webpack-bundle-analyzer |

### SOLID Compliance Checklist

- [ ] **SRP**: Each class/module has single responsibility
- [ ] **OCP**: Features extensible without modifying existing code
- [ ] **LSP**: Proper abstraction hierarchies
- [ ] **ISP**: Small, focused interfaces
- [ ] **DIP**: Depend on abstractions, not implementations

### Performance Metrics

- [ ] Lighthouse Score: >90
- [ ] First Contentful Paint: <1.5s
- [ ] Time to Interactive: <3s
- [ ] Unnecessary Re-renders: <5% of total renders

---

## 🔄 Migration Strategy

### Gradual Migration Approach

**Phase 1 Week:**
- Day 1-2: Setup foundation (ApiClient, AsyncState)
- Day 3-4: Migrate 2 stores (problems, submissions)
- Day 5: Testing & fixes

**Phase 2 Week:**
- Day 1-2: Repository pattern for all domains
- Day 3-4: Service layer extraction
- Day 5: Testing & fixes

**Phase 3 Week:**
- Day 1-2: Plugin system
- Day 3: Selectors & performance
- Day 4: Type safety audit
- Day 5: Final testing & documentation

### Rollback Plan

Each phase has isolated changes:
- Phase 1 failure → Revert foundation only
- Phase 2 failure → Keep Phase 1, revert repositories
- Phase 3 failure → Keep Phases 1-2, revert plugins

---

## 📚 Documentation Updates

### Files to Update/Create

- [ ] `docs/frontend-architecture.md` - New architecture overview
- [ ] `docs/coding-standards.md` - Add SOLID principles guide
- [ ] `docs/testing-strategy.md` - Testing best practices
- [ ] `frontend/README.md` - Developer onboarding guide
- [ ] Inline JSDoc comments for all public APIs

---

## 🧪 Testing Strategy

### Test Coverage Requirements

- **Unit Tests**: All services, repositories, utilities
- **Integration Tests**: Store + Repository + Service
- **E2E Tests**: Critical user flows
- **Performance Tests**: Benchmark before/after

### Test Files to Create

```
frontend/
  src/
    shared/
      api/core/__tests__/
        apiClient.test.ts
      state/__tests__/
        asyncState.test.ts
        createAsyncAction.test.ts
      repositories/__tests__/
        ApiProblemRepository.test.ts
        MockProblemRepository.test.ts
    domains/
      submission/__tests__/
        SubmissionPollingService.test.ts
```

---

## 🚀 Deployment Checklist

Before merging to main:

- [ ] All tests passing (100%)
- [ ] Code review completed
- [ ] Performance benchmarks verified
- [ ] Documentation updated
- [ ] Migration guide created
- [ ] Rollback plan tested
- [ ] Staging deployment successful
- [ ] No console errors/warnings
- [ ] Bundle size checked
- [ ] Lighthouse audit passed

---

## 📝 Notes

### Breaking Changes

None expected - this is internal refactoring. Public API (component props) remains the same.

### Dependencies to Add

```json
{
  "devDependencies": {
    "@testing-library/react-hooks": "^8.0.1",
    "@testing-library/jest-dom": "^6.1.5",
    "webpack-bundle-analyzer": "^4.10.1"
  }
}
```

### Team Communication

- Weekly progress updates
- Daily standup mentions
- Slack channel: #frontend-refactoring
- Code review pairing sessions

---

## 🔗 References

- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [DRY Principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Zustand Best Practices](https://github.com/pmndrs/zustand#best-practices)

---

**Last Updated:** 2025-12-04
**Next Review:** After Phase 1 completion
