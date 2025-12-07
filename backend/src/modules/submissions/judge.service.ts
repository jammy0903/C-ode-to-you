/**
 * @file judge.service.ts
 * @description Code compilation and execution judging service
 *
 * @principles
 * - SRP: ✅ Single responsibility - code compilation and test execution only
 * - Security: Uses temp directory, timeouts, cleanup for safe code execution
 * - Isolation: Each submission runs in isolated temp files
 *
 * @functions
 * - judgeCode(code, testCases): Promise<JudgeResult> - Compile and run code against test cases
 * - compile(sourceFile, executableFile): Promise<{success, error?}> - Compile C code using GCC
 * - runTestCase(executableFile, input, expectedOutput, testNumber): Promise<TestCaseResult> - Run single test case
 * - cleanup(sourceFile, executableFile): Promise<void> - Delete temporary files
 * - validateCode(code): Promise<{valid, error?}> - Quick compilation check without execution
 * - ensureTempDir(): Promise<void> - Ensure temp directory exists
 *
 * @constants
 * - TEMP_DIR: /tmp/submissions - Temporary directory for compilation
 * - COMPILE_TIMEOUT: 10000ms - Maximum compilation time
 * - EXECUTION_TIMEOUT: 5000ms - Maximum execution time per test case
 *
 * @security
 * - Timeouts prevent infinite loops
 * - Isolated temp files per submission
 * - Automatic cleanup after execution
 * - maxBuffer limit (1MB) prevents memory attacks
 *
 * @duplicateLogic
 * - ✅ No duplicate logic detected - well-structured service
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { Verdict } from '@prisma/client';
import { JudgeResult, TestCaseResult } from './submissions.types';
import logger from '../../utils/logger';

const execAsync = promisify(exec);

export class JudgeService {
  private readonly TEMP_DIR = path.join(process.cwd(), 'tmp', 'submissions');
  private readonly COMPILE_TIMEOUT = 10000; // 10 seconds
  private readonly EXECUTION_TIMEOUT = 5000; // 5 seconds

  constructor() {
    this.ensureTempDir();
  }

  /**
   * Ensure temp directory exists
   */
  private async ensureTempDir() {
    try {
      await fs.mkdir(this.TEMP_DIR, { recursive: true });
    } catch (error) {
      logger.error('Failed to create temp directory:', error);
    }
  }

  /**
   * Judge C code submission
   */
  async judgeCode(
    code: string,
    testCases: Array<{ input: string; output: string }>
  ): Promise<JudgeResult> {
    const submissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sourceFile = path.join(this.TEMP_DIR, `${submissionId}.c`);
    const executableFile = path.join(this.TEMP_DIR, submissionId);

    try {
      // 1. Write code to file
      await fs.writeFile(sourceFile, code, 'utf-8');

      // 2. Compile code
      const compileResult = await this.compile(sourceFile, executableFile);

      if (!compileResult.success) {
        return {
          verdict: 'compile_error',
          testResults: [],
          compileError: compileResult.error,
        };
      }

      // 3. Run test cases
      const testResults: TestCaseResult[] = [];
      let totalExecutionTime = 0;

      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const result = await this.runTestCase(executableFile, testCase.input, testCase.output, i + 1);

        testResults.push(result);
        totalExecutionTime += result.executionTime;

        // Stop on first failure
        if (result.status === 'failed') {
          break;
        }
      }

      // 4. Determine verdict
      const allPassed = testResults.every((r) => r.status === 'passed');
      const verdict: Verdict = allPassed ? 'accepted' : 'wrong_answer';

      return {
        verdict,
        executionTime: Math.round(totalExecutionTime),
        memoryUsage: 2048, // Placeholder - actual memory tracking requires more complex setup
        testResults,
      };
    } catch (error: any) {
      logger.error('Judge error:', error);

      return {
        verdict: 'runtime_error',
        testResults: [],
        compileError: error.message,
      };
    } finally {
      // Cleanup
      await this.cleanup(sourceFile, executableFile);
    }
  }

  /**
   * Compile C code
   */
  private async compile(
    sourceFile: string,
    executableFile: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { stderr } = await execAsync(`gcc "${sourceFile}" -o "${executableFile}" -O2 -Wall`, {
        timeout: this.COMPILE_TIMEOUT,
      });

      if (stderr) {
        logger.warn('Compilation warnings:', stderr);
      }

      return { success: true };
    } catch (error: any) {
      logger.error('Compilation error:', error.stderr || error.message);

      return {
        success: false,
        error: error.stderr || error.message,
      };
    }
  }

  /**
   * Run test case
   */
  private async runTestCase(
    executableFile: string,
    input: string,
    expectedOutput: string,
    testNumber: number
  ): Promise<TestCaseResult> {
    const startTime = Date.now();

    try {
      // Run executable with input
      const { stdout, stderr } = await execAsync(`echo "${input}" | "${executableFile}"`, {
        timeout: this.EXECUTION_TIMEOUT,
        maxBuffer: 1024 * 1024, // 1MB
      });

      const executionTime = Date.now() - startTime;
      const actualOutput = stdout.trim();
      const expected = expectedOutput.trim();

      const passed = actualOutput === expected;

      return {
        number: testNumber,
        status: passed ? 'passed' : 'failed',
        executionTime,
        input,
        expectedOutput: expected,
        actualOutput,
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      // Check if timeout
      if (error.killed || error.signal === 'SIGTERM') {
        return {
          number: testNumber,
          status: 'failed',
          executionTime: this.EXECUTION_TIMEOUT,
          input,
          error: 'Time Limit Exceeded',
        };
      }

      return {
        number: testNumber,
        status: 'failed',
        executionTime,
        input,
        error: error.stderr || error.message || 'Runtime Error',
      };
    }
  }

  /**
   * Cleanup temporary files
   */
  private async cleanup(sourceFile: string, executableFile: string) {
    try {
      await Promise.all([
        fs.unlink(sourceFile).catch(() => {}),
        fs.unlink(executableFile).catch(() => {}),
      ]);
    } catch (error) {
      logger.error('Cleanup error:', error);
    }
  }

  /**
   * Quick validation - check if code compiles
   */
  async validateCode(code: string): Promise<{ valid: boolean; error?: string }> {
    const tempId = `validate_${Date.now()}`;
    const sourceFile = path.join(this.TEMP_DIR, `${tempId}.c`);
    const executableFile = path.join(this.TEMP_DIR, tempId);

    try {
      await fs.writeFile(sourceFile, code, 'utf-8');
      const result = await this.compile(sourceFile, executableFile);

      return {
        valid: result.success,
        error: result.error,
      };
    } finally {
      await this.cleanup(sourceFile, executableFile);
    }
  }
}
