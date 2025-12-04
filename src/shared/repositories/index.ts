/**
 * Repository Pattern
 *
 * Central export for all repository interfaces and implementations.
 * Provides easy access to repository instances throughout the application.
 */

// Export interfaces for type checking and mocking
export * from './interfaces';

// Export implementations and factory
export * from './implementations';

// Re-export default repository instances for convenience
export { repositories } from './implementations';
