/**
 * React Interceptor Export
 * 
 * Usage:
 * import { ReduxInterceptor, ErrorInterceptor } from '@syntropyfront/interceptors/react';
 * syntropyFront.injectCustomInterceptor('redux', ReduxInterceptor);
 * syntropyFront.injectCustomInterceptor('error', ErrorInterceptor);
 */

export { default as ReduxInterceptor } from './ReduxInterceptor.js';
export { default as ErrorInterceptor } from './ErrorInterceptor.js'; 