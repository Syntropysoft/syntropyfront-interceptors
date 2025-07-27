/**
 * @syntropyfront/interceptors
 * Official interceptors for SyntropyFront
 * 
 * This package provides framework-specific interceptors that can be used
 * with the core SyntropyFront library via the injectCustomInterceptor() method.
 */

// Export individual interceptors
export { default as ReduxInterceptor } from './ReduxInterceptor.js';
export { default as VuexInterceptor } from './VuexInterceptor.js';
export { default as ErrorInterceptor } from './ErrorInterceptor.js';

// Export all interceptors as a collection
export const interceptors = {
  redux: ReduxInterceptor,
  vuex: VuexInterceptor,
  error: ErrorInterceptor
};

// Default export
export default interceptors; 