/**
 * @file ValidationService.test.ts
 * @description Unit tests for ValidationService
 */

import { ValidationService, ValidationResult } from '../ValidationService';

describe('ValidationService', () => {
  describe('validateSubmissionCode', () => {
    it('should reject empty code', () => {
      const result = ValidationService.validateSubmissionCode('', 'c');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Code cannot be empty');
    });

    it('should reject code that is too short', () => {
      const result = ValidationService.validateSubmissionCode('int a;', 'c');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Code is too short (minimum 10 characters)');
    });

    it('should reject code that is too long', () => {
      const longCode = 'a'.repeat(100_001);
      const result = ValidationService.validateSubmissionCode(longCode, 'c');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Code is too long (maximum 100KB)');
    });

    it('should reject C code without main function', () => {
      const code = '#include <stdio.h>\nvoid foo() { printf("test"); }';
      const result = ValidationService.validateSubmissionCode(code, 'c');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('C code must contain a main function');
    });

    it('should reject C code without braces', () => {
      const code = 'int main() return 0;';
      const result = ValidationService.validateSubmissionCode(code, 'c');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid C syntax: missing braces');
    });

    it('should accept valid C code', () => {
      const code = `#include <stdio.h>
int main() {
    printf("Hello World");
    return 0;
}`;
      const result = ValidationService.validateSubmissionCode(code, 'c');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateDraft', () => {
    it('should accept empty drafts', () => {
      const result = ValidationService.validateDraft('');

      expect(result.valid).toBe(true);
    });

    it('should reject drafts that are too long', () => {
      const longDraft = 'a'.repeat(100_001);
      const result = ValidationService.validateDraft(longDraft);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Draft is too long (maximum 100KB)');
    });

    it('should accept short drafts', () => {
      const result = ValidationService.validateDraft('int a;');

      expect(result.valid).toBe(true);
    });
  });

  describe('validateSearchQuery', () => {
    it('should reject single-character queries', () => {
      const result = ValidationService.validateSearchQuery('a');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Search query must be at least 2 characters');
    });

    it('should reject queries that are too long', () => {
      const longQuery = 'a'.repeat(101);
      const result = ValidationService.validateSearchQuery(longQuery);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Search query is too long (maximum 100 characters)');
    });

    it('should reject queries with invalid characters', () => {
      const result = ValidationService.validateSearchQuery('test<script>');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Search query contains invalid characters');
    });

    it('should accept valid search queries', () => {
      const result = ValidationService.validateSearchQuery('array sorting');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept empty queries', () => {
      const result = ValidationService.validateSearchQuery('');

      expect(result.valid).toBe(true);
    });
  });

  describe('validateUserSettings', () => {
    it('should reject invalid theme values', () => {
      const result = ValidationService.validateUserSettings({ theme: 'invalid' as any });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid theme value');
    });

    it('should accept valid theme values', () => {
      const result1 = ValidationService.validateUserSettings({ theme: 'light' });
      const result2 = ValidationService.validateUserSettings({ theme: 'dark' });
      const result3 = ValidationService.validateUserSettings({ theme: 'system' });

      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
      expect(result3.valid).toBe(true);
    });

    it('should reject font size outside valid range', () => {
      const result1 = ValidationService.validateUserSettings({ fontSize: 7 });
      const result2 = ValidationService.validateUserSettings({ fontSize: 25 });

      expect(result1.valid).toBe(false);
      expect(result2.valid).toBe(false);
      expect(result1.errors).toContain('Font size must be between 8 and 24');
    });

    it('should accept valid font sizes', () => {
      const result = ValidationService.validateUserSettings({ fontSize: 14 });

      expect(result.valid).toBe(true);
    });

    it('should reject invalid language codes', () => {
      const result = ValidationService.validateUserSettings({ language: 'eng' });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Language code must be 2 characters (e.g., "ko", "en")');
    });

    it('should accept valid language codes', () => {
      const result = ValidationService.validateUserSettings({ language: 'ko' });

      expect(result.valid).toBe(true);
    });
  });

  describe('validateProblemId', () => {
    it('should reject empty IDs', () => {
      const result = ValidationService.validateProblemId('');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Problem ID cannot be empty');
    });

    it('should reject IDs with invalid characters', () => {
      const result = ValidationService.validateProblemId('test@#$');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid problem ID format');
    });

    it('should reject IDs that are too long', () => {
      const longId = 'a'.repeat(51);
      const result = ValidationService.validateProblemId(longId);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Problem ID is too long');
    });

    it('should accept valid problem IDs', () => {
      const result1 = ValidationService.validateProblemId('123');
      const result2 = ValidationService.validateProblemId('abc-123_def');

      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
    });
  });

  describe('validateChatMessage', () => {
    it('should reject empty messages', () => {
      const result = ValidationService.validateChatMessage('');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Message cannot be empty');
    });

    it('should reject messages that are too short', () => {
      const result = ValidationService.validateChatMessage('a');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Message is too short (minimum 2 characters)');
    });

    it('should reject messages that are too long', () => {
      const longMessage = 'a'.repeat(5001);
      const result = ValidationService.validateChatMessage(longMessage);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Message is too long (maximum 5000 characters)');
    });

    it('should accept valid messages', () => {
      const result = ValidationService.validateChatMessage('How do I solve this problem?');

      expect(result.valid).toBe(true);
    });
  });

  describe('validateEmail', () => {
    it('should reject invalid email formats', () => {
      const result1 = ValidationService.validateEmail('invalid');
      const result2 = ValidationService.validateEmail('test@');
      const result3 = ValidationService.validateEmail('@test.com');

      expect(result1.valid).toBe(false);
      expect(result2.valid).toBe(false);
      expect(result3.valid).toBe(false);
    });

    it('should accept valid email formats', () => {
      const result1 = ValidationService.validateEmail('test@example.com');
      const result2 = ValidationService.validateEmail('user.name+tag@example.co.kr');

      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
    });
  });

  describe('sanitizeHtml', () => {
    it('should escape HTML special characters', () => {
      const html = '<script>alert("XSS")</script>';
      const sanitized = ValidationService.sanitizeHtml(html);

      expect(sanitized).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('should escape quotes', () => {
      const html = `<img src="x" onerror='alert(1)'>`;
      const sanitized = ValidationService.sanitizeHtml(html);

      expect(sanitized).not.toContain('"');
      expect(sanitized).not.toContain("'");
    });
  });

  describe('formatErrors', () => {
    it('should return empty string for no errors', () => {
      const formatted = ValidationService.formatErrors([]);

      expect(formatted).toBe('');
    });

    it('should return single error as-is', () => {
      const formatted = ValidationService.formatErrors(['Error 1']);

      expect(formatted).toBe('Error 1');
    });

    it('should format multiple errors as numbered list', () => {
      const formatted = ValidationService.formatErrors(['Error 1', 'Error 2', 'Error 3']);

      expect(formatted).toBe('1. Error 1\n2. Error 2\n3. Error 3');
    });
  });

  describe('combineResults', () => {
    it('should return valid for all valid results', () => {
      const result1: ValidationResult = { valid: true, errors: [] };
      const result2: ValidationResult = { valid: true, errors: [] };

      const combined = ValidationService.combineResults(result1, result2);

      expect(combined.valid).toBe(true);
      expect(combined.errors).toHaveLength(0);
    });

    it('should return invalid if any result is invalid', () => {
      const result1: ValidationResult = { valid: true, errors: [] };
      const result2: ValidationResult = { valid: false, errors: ['Error 1'] };
      const result3: ValidationResult = { valid: false, errors: ['Error 2'] };

      const combined = ValidationService.combineResults(result1, result2, result3);

      expect(combined.valid).toBe(false);
      expect(combined.errors).toEqual(['Error 1', 'Error 2']);
    });
  });
});
