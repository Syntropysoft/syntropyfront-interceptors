/**
 * Test ErrorInterceptor
 * 
 * This file demonstrates how to use the new ErrorInterceptor
 * with SyntropyFront for automatic error capture.
 */

import { ErrorInterceptor } from './dist/index.js';

// Mock SyntropyFront instance for testing
const mockSyntropyFront = {
    breadcrumbs: [],
    errors: [],
    
    addBreadcrumb(category, message, data = {}) {
        this.breadcrumbs.push({
            category,
            message,
            data,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 breadcrumbs
        if (this.breadcrumbs.length > 10) {
            this.breadcrumbs = this.breadcrumbs.slice(-10);
        }
    },
    
    getBreadcrumbs() {
        return this.breadcrumbs;
    },
    
    sendError(errorPayload) {
        this.errors.push(errorPayload);
        console.log('📤 Error sent to SyntropyFront:', errorPayload);
    },
    
    clearBreadcrumbs() {
        this.breadcrumbs = [];
    },
    
    clearErrors() {
        this.errors = [];
    }
};

// Test function
function testErrorInterceptor() {
    console.log('🧪 Testing ErrorInterceptor...\n');
    
    // Create error interceptor instance
    const errorInterceptor = new ErrorInterceptor();
    
    // Initialize with mock SyntropyFront
    errorInterceptor.init(mockSyntropyFront, {
        logToConsole: true
    });
    
    console.log('✅ ErrorInterceptor initialized\n');
    
    // Add some breadcrumbs
    mockSyntropyFront.addBreadcrumb('user', 'User clicked button');
    mockSyntropyFront.addBreadcrumb('navigation', 'User navigated to /dashboard');
    mockSyntropyFront.addBreadcrumb('api', 'API call to /users');
    
    console.log('📝 Added breadcrumbs:', mockSyntropyFront.getBreadcrumbs().length);
    
    // Test 1: Simulate uncaught error
    console.log('\n🔥 Test 1: Simulating uncaught error...');
    setTimeout(() => {
        const obj = null;
        console.log(obj.nonExistentProperty); // This will trigger window.onerror
    }, 1000);
    
    // Test 2: Simulate unhandled promise rejection
    console.log('\n🔥 Test 2: Simulating unhandled promise rejection...');
    setTimeout(() => {
        Promise.reject(new Error('Test promise rejection'));
    }, 2000);
    
    // Test 3: Check status
    setTimeout(() => {
        console.log('\n📊 ErrorInterceptor Status:', errorInterceptor.getStatus());
        console.log('📊 Errors captured:', mockSyntropyFront.errors.length);
        console.log('📊 Breadcrumbs:', mockSyntropyFront.breadcrumbs.length);
        
        // Cleanup
        errorInterceptor.destroy();
        console.log('\n🧹 Test completed and interceptor destroyed');
    }, 3000);
}

// Run test if in browser environment
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', testErrorInterceptor);
    } else {
        testErrorInterceptor();
    }
} else {
    console.log('🌐 This test requires a browser environment');
    console.log('💡 Run this in a browser or use the React example');
}

export { ErrorInterceptor, mockSyntropyFront }; 