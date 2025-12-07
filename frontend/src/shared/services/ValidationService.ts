/**
 * @file ValidationService.ts
 * @description Validation service - centralized validation logic
 * 
 * @principles
 * - SRP: ✅ Single responsibility: validation logic only (pure functions)
 * - CQS: ✅ All methods are Queries (return ValidationResult, no side effects)
 * - DIP: ✅ No dependencies (pure functions)
 * - Composition: ✅ Composable validation operations
 * 
 * @functions (all static, pure)
 * - validateSubmissionCode(code, language): ValidationResult - Validate submission code
 * - validateDraft(code): ValidationResult - Validate draft code (lenient)
 * - validateSearchQuery(query): ValidationResult - Validate search query
 * - validateUserSettings(settings): ValidationResult - Validate user settings
 * - validateProblemId(id): ValidationResult - Validate problem ID format
 * - validateSubmissionId(id): ValidationResult - Validate submission ID format
 * - validateChatMessage(message): ValidationResult - Validate chat message
 * - validateEmail(email): ValidationResult - Validate email format
 * - sanitizeHtml(html): string - Sanitize HTML to prevent XSS
 * - formatErrors(errors): string - Format errors as single message
 * - combineResults(...results): ValidationResult - Combine multiple validation results
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class ValidationService {
  /**
   * Validate submission code
   */
  static validateSubmissionCode(code: string, language: string): ValidationResult {
    const errors: string[] = [];

    // Check if code is empty
    if (!code || code.trim().length === 0) {
      errors.push('Code cannot be empty');
    }

    // Check minimum length
    if (code.length < 10) {
      errors.push('Code is too short (minimum 10 characters)');
    }

    // Check maximum length (100KB)
    if (code.length > 100_000) {
      errors.push('Code is too long (maximum 100KB)');
    }

    // Language-specific validation
    if (language === 'c') {
      // Check for main function
      if (!code.includes('main')) {
        errors.push('C code must contain a main function');
      }

      // Check for basic C syntax
      if (!code.includes('{') || !code.includes('}')) {
        errors.push('Invalid C syntax: missing braces');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate draft code before saving
   */
  static validateDraft(code: string): ValidationResult {
    const errors: string[] = [];

    // More lenient than submission validation
    if (code.length > 100_000) {
      errors.push('Draft is too long (maximum 100KB)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate search query
   */
  static validateSearchQuery(query: string): ValidationResult {
    const errors: string[] = [];

    const trimmed = query.trim();

    // Check minimum length
    if (trimmed.length > 0 && trimmed.length < 2) {
      errors.push('Search query must be at least 2 characters');
    }

    // Check maximum length
    if (trimmed.length > 100) {
      errors.push('Search query is too long (maximum 100 characters)');
    }

    // Check for invalid characters (optional)
    const invalidChars = /[<>]/g;
    if (invalidChars.test(trimmed)) {
      errors.push('Search query contains invalid characters');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate user settings
   */
  static validateUserSettings(settings: {
    theme?: 'light' | 'dark' | 'system';
    fontSize?: number;
    language?: string;
  }): ValidationResult {
    const errors: string[] = [];

    // Validate theme
    if (settings.theme && !['light', 'dark', 'system'].includes(settings.theme)) {
      errors.push('Invalid theme value');
    }

    // Validate fontSize
    if (settings.fontSize !== undefined) {
      if (settings.fontSize < 8 || settings.fontSize > 24) {
        errors.push('Font size must be between 8 and 24');
      }
    }

    // Validate language
    if (settings.language && settings.language.length !== 2) {
      errors.push('Language code must be 2 characters (e.g., "ko", "en")');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate problem ID
   */
  static validateProblemId(id: string): ValidationResult {
    const errors: string[] = [];

    if (!id || id.trim().length === 0) {
      errors.push('Problem ID cannot be empty');
    }

    // Check format (assuming numeric or alphanumeric)
    const validFormat = /^[a-zA-Z0-9_-]+$/;
    if (!validFormat.test(id)) {
      errors.push('Invalid problem ID format');
    }

    if (id.length > 50) {
      errors.push('Problem ID is too long');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate submission ID
   */
  static validateSubmissionId(id: string): ValidationResult {
    const errors: string[] = [];

    if (!id || id.trim().length === 0) {
      errors.push('Submission ID cannot be empty');
    }

    // Typically UUIDs or numeric IDs
    const validFormat = /^[a-zA-Z0-9_-]+$/;
    if (!validFormat.test(id)) {
      errors.push('Invalid submission ID format');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate chat message
   */
  static validateChatMessage(message: string): ValidationResult {
    const errors: string[] = [];

    const trimmed = message.trim();

    if (trimmed.length === 0) {
      errors.push('Message cannot be empty');
    }

    if (trimmed.length < 2) {
      errors.push('Message is too short (minimum 2 characters)');
    }

    if (trimmed.length > 5000) {
      errors.push('Message is too long (maximum 5000 characters)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize HTML to prevent XSS
   */
  static sanitizeHtml(html: string): string {
    // Basic sanitization - in production, use a library like DOMPurify
    return html
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Format validation errors as a single message
   */
  static formatErrors(errors: string[]): string {
    if (errors.length === 0) {
      return '';
    }

    if (errors.length === 1) {
      return errors[0];
    }

    return errors.map((err, index) => `${index + 1}. ${err}`).join('\n');
  }

  /**
   * Combine multiple validation results
   */
  static combineResults(...results: ValidationResult[]): ValidationResult {
    const allErrors = results.flatMap((r) => r.errors);

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
    };
  }
}
