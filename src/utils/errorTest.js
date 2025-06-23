// Error Testing Utilities for NASA Explorer
// This file contains functions to test various error scenarios

import apiService, { ErrorTypes, APIError } from '../services/api';

// Test different error scenarios
export const testErrorScenarios = {
  // Test network errors
  testNetworkError: async () => {
    console.log('🧪 Testing network error...');
    try {
      // Temporarily change API URL to invalid endpoint
      const originalUrl = apiService.API_BASE_URL;
      apiService.API_BASE_URL = 'http://invalid-url-that-does-not-exist.com';
      
      await apiService.fetchAPOD();
    } catch (error) {
      console.log('✅ Network error caught:', error.message);
      console.log('Error type:', error.type);
      console.log('Retryable:', error.retryable);
    } finally {
      // Restore original URL
      apiService.API_BASE_URL = originalUrl;
    }
  },

  // Test validation errors
  testValidationError: async () => {
    console.log('🧪 Testing validation error...');
    try {
      // Test invalid date format
      apiService.validateDate('invalid-date');
    } catch (error) {
      console.log('✅ Validation error caught:', error.message);
      console.log('Error type:', error.type);
    }
  },

  // Test future date error
  testFutureDateError: async () => {
    console.log('🧪 Testing future date error...');
    try {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      apiService.validateDate(futureDateString);
    } catch (error) {
      console.log('✅ Future date error caught:', error.message);
      console.log('Error type:', error.type);
    }
  },

  // Test past date error
  testPastDateError: async () => {
    console.log('🧪 Testing past date error...');
    try {
      apiService.validateDate('1990-01-01');
    } catch (error) {
      console.log('✅ Past date error caught:', error.message);
      console.log('Error type:', error.type);
    }
  },

  // Test rate limit simulation
  testRateLimitError: async () => {
    console.log('🧪 Testing rate limit error...');
    try {
      // Create a mock rate limit error
      const rateLimitError = new APIError(
        'Too many requests from this IP, please try again later.',
        ErrorTypes.RATE_LIMIT,
        429,
        true
      );
      throw rateLimitError;
    } catch (error) {
      console.log('✅ Rate limit error caught:', error.message);
      console.log('Error type:', error.type);
      console.log('Retryable:', error.retryable);
    }
  },

  // Test server error
  testServerError: async () => {
    console.log('🧪 Testing server error...');
    try {
      const serverError = new APIError(
        'Internal server error occurred.',
        ErrorTypes.SERVER,
        500,
        true
      );
      throw serverError;
    } catch (error) {
      console.log('✅ Server error caught:', error.message);
      console.log('Error type:', error.type);
      console.log('Retryable:', error.retryable);
    }
  },

  // Test client error
  testClientError: async () => {
    console.log('🧪 Testing client error...');
    try {
      const clientError = new APIError(
        'Invalid request parameters.',
        ErrorTypes.CLIENT,
        400,
        false
      );
      throw clientError;
    } catch (error) {
      console.log('✅ Client error caught:', error.message);
      console.log('Error type:', error.type);
      console.log('Retryable:', error.retryable);
    }
  },

  // Test retry logic
  testRetryLogic: async () => {
    console.log('🧪 Testing retry logic...');
    let attemptCount = 0;
    
    const mockFailingFunction = async () => {
      attemptCount++;
      console.log(`Attempt ${attemptCount}`);
      
      if (attemptCount < 3) {
        throw new APIError(
          'Temporary server error',
          ErrorTypes.SERVER,
          500,
          true
        );
      }
      
      return { success: true, data: 'Retry successful!' };
    };

    try {
      const result = await apiService.withRetry(mockFailingFunction);
      console.log('✅ Retry successful:', result);
    } catch (error) {
      console.log('❌ Retry failed:', error.message);
    }
  },

  // Test all error scenarios
  runAllTests: async () => {
    console.log('🚀 Starting error handling tests...\n');
    
    await testErrorScenarios.testNetworkError();
    console.log('');
    
    await testErrorScenarios.testValidationError();
    console.log('');
    
    await testErrorScenarios.testFutureDateError();
    console.log('');
    
    await testErrorScenarios.testPastDateError();
    console.log('');
    
    await testErrorScenarios.testRateLimitError();
    console.log('');
    
    await testErrorScenarios.testServerError();
    console.log('');
    
    await testErrorScenarios.testClientError();
    console.log('');
    
    await testErrorScenarios.testRetryLogic();
    console.log('');
    
    console.log('✅ All error handling tests completed!');
  }
};

// Error simulation helpers
export const simulateError = (errorType, message = '') => {
  const errorMessages = {
    [ErrorTypes.NETWORK]: 'Network connection issue. Please check your internet connection and try again.',
    [ErrorTypes.SERVER]: 'Server error. Please try again later.',
    [ErrorTypes.CLIENT]: 'Invalid request. Please check your input.',
    [ErrorTypes.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
    [ErrorTypes.VALIDATION]: 'Invalid input provided.',
    [ErrorTypes.UNKNOWN]: 'An unexpected error occurred.'
  };

  return new APIError(
    message || errorMessages[errorType],
    errorType,
    getStatusCodeForErrorType(errorType),
    isRetryableErrorType(errorType)
  );
};

// Helper functions
const getStatusCodeForErrorType = (errorType) => {
  const statusCodes = {
    [ErrorTypes.NETWORK]: 0,
    [ErrorTypes.SERVER]: 500,
    [ErrorTypes.CLIENT]: 400,
    [ErrorTypes.RATE_LIMIT]: 429,
    [ErrorTypes.VALIDATION]: 400,
    [ErrorTypes.UNKNOWN]: 0
  };
  
  return statusCodes[errorType] || 0;
};

const isRetryableErrorType = (errorType) => {
  const retryableTypes = [
    ErrorTypes.NETWORK,
    ErrorTypes.SERVER,
    ErrorTypes.RATE_LIMIT
  ];
  
  return retryableTypes.includes(errorType);
};

// Export for use in development
if (process.env.NODE_ENV === 'development') {
  window.testErrorScenarios = testErrorScenarios;
  window.simulateError = simulateError;
  console.log('🧪 Error testing utilities loaded. Use testErrorScenarios.runAllTests() to test all scenarios.');
} 