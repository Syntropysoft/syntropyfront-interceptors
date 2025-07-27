/**
 * @syntropyfront/interceptors
 * Official interceptors for SyntropyFront
 * 
 * This package provides framework-specific interceptors that can be used
 * with the core SyntropyFront library via the injectCustomInterceptor() method.
 */

// Import and re-export ErrorInterceptor
import ErrorInterceptor from './ErrorInterceptor.js';

// Export individual interceptors
export { ErrorInterceptor };

// Export all interceptors as a collection
export const interceptors = {
  error: ErrorInterceptor
};

// Default export
export default interceptors; 