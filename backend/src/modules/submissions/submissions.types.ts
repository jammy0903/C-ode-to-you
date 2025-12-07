import { Submission, Verdict } from '@prisma/client';

export interface SubmitCodeRequest {
  code: string;
  language: string;
}

export interface TestCaseResult {
  number: number;
  status: 'passed' | 'failed';
  executionTime: number;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  error?: string;
}

export interface JudgeResult {
  verdict: Verdict;
  executionTime?: number;
  memoryUsage?: number;
  testResults: TestCaseResult[];
  compileError?: string;
}

export interface SubmissionResponse extends Submission {
  problem?: {
    number: number;
    title: string;
  };
}

export interface SubmissionListItem {
  submissionId: string;
  problemNumber: number;
  problemTitle: string;
  verdict: Verdict;
  executionTime?: number;
  submittedAt: Date;
  githubCommitUrl?: string;
}
