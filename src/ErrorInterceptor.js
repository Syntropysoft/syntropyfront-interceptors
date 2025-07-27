/**
 * ErrorInterceptor - Automatic error and promise rejection capture
 * Single responsibility: Capture uncaught errors and unhandled promise rejections
 * 
 * This interceptor automatically sets up window.onerror and window.onunhandledrejection
 * to capture errors and collect breadcrumbs when they occur.
 * 
 * Usage:
 * import { ErrorInterceptor } from '@syntropyfront/interceptors';
 * syntropyFront.injectCustomInterceptor('error', ErrorInterceptor);
 */

/**
 * ErrorInterceptor Class
 * Automatically captures uncaught errors and unhandled promise rejections
 */
class ErrorInterceptor {
    constructor() {
        this.isInitialized = false;
        this.originalHandlers = {};
        this.breadcrumbCollector = null;
        this.errorHandler = null;
    }

    /**
     * Initialize the error interceptor
     * @param {Object} syntropyFront - SyntropyFront instance
     * @param {Object} config - Configuration options
     */
    init(syntropyFront, config = {}) {
        if (this.isInitialized) {
            console.warn('ErrorInterceptor: Already initialized');
            return;
        }

        if (typeof window === 'undefined') {
            console.warn('ErrorInterceptor: Window not available, skipping initialization');
            return;
        }

        this.syntropyFront = syntropyFront;
        this.config = {
            captureErrors: true,
            captureUnhandledRejections: true,
            logToConsole: true, // For debugging
            ...config
        };

        this.setupErrorInterceptors();
        this.isInitialized = true;
        
        if (this.config.logToConsole) {
            console.log('🚀 ErrorInterceptor: Automatic error capture initialized');
        }
    }

    /**
     * Setup automatic error interceptors
     */
    setupErrorInterceptors() {
        // Intercept uncaught errors
        if (this.config.captureErrors) {
            this.originalHandlers.onerror = window.onerror;
            window.onerror = (message, source, lineno, colno, error) => {
                const errorPayload = {
                    type: 'uncaught_exception',
                    error: { 
                        message, 
                        source, 
                        lineno, 
                        colno, 
                        stack: error?.stack 
                    },
                    breadcrumbs: this.getBreadcrumbs(),
                    timestamp: new Date().toISOString()
                };

                // Log to console for debugging
                if (this.config.logToConsole) {
                    console.log('🚨 ErrorInterceptor - Error detected automatically:', errorPayload);
                }
                
                // Send to SyntropyFront
                this.sendError(errorPayload);
                
                // Call original handler if exists
                if (this.originalHandlers.onerror) {
                    return this.originalHandlers.onerror(message, source, lineno, colno, error);
                }
                
                return false;
            };
        }

        // Intercept rejected promises
        if (this.config.captureUnhandledRejections) {
            this.originalHandlers.onunhandledrejection = window.onunhandledrejection;
            window.onunhandledrejection = (event) => {
                const errorPayload = {
                    type: 'unhandled_rejection',
                    error: {
                        message: event.reason?.message || 'Promise rejection without message',
                        stack: event.reason?.stack,
                    },
                    breadcrumbs: this.getBreadcrumbs(),
                    timestamp: new Date().toISOString()
                };

                // Log to console for debugging
                if (this.config.logToConsole) {
                    console.log('🚨 ErrorInterceptor - Promise rejection detected automatically:', errorPayload);
                }
                
                // Send to SyntropyFront
                this.sendError(errorPayload);
                
                // Call original handler if exists
                if (this.originalHandlers.onunhandledrejection) {
                    this.originalHandlers.onunhandledrejection(event);
                }
            };
        }
    }

    /**
     * Get breadcrumbs from SyntropyFront
     * @returns {Array} Array of breadcrumbs
     */
    getBreadcrumbs() {
        if (this.syntropyFront && typeof this.syntropyFront.getBreadcrumbs === 'function') {
            return this.syntropyFront.getBreadcrumbs();
        }
        return [];
    }

    /**
     * Send error to SyntropyFront
     * @param {Object} errorPayload - Error payload to send
     */
    sendError(errorPayload) {
        if (this.syntropyFront && typeof this.syntropyFront.sendError === 'function') {
            this.syntropyFront.sendError(errorPayload);
        }
    }

    /**
     * Destroy the interceptor and restore original handlers
     */
    destroy() {
        if (!this.isInitialized) return;

        // Restore original error handlers
        if (this.originalHandlers.onerror) {
            window.onerror = this.originalHandlers.onerror;
        }

        if (this.originalHandlers.onunhandledrejection) {
            window.onunhandledrejection = this.originalHandlers.onunhandledrejection;
        }

        this.isInitialized = false;
        this.originalHandlers = {};
        
        if (this.config.logToConsole) {
            console.log('🧹 ErrorInterceptor: Destroyed and handlers restored');
        }
    }

    /**
     * Get interceptor status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            config: this.config,
            hasOriginalHandlers: {
                onerror: !!this.originalHandlers.onerror,
                onunhandledrejection: !!this.originalHandlers.onunhandledrejection
            }
        };
    }
}

export default ErrorInterceptor; 