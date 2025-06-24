const API_BASE_URL = '/api';

// Error types for better error handling
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  SERVER: 'SERVER_ERROR',
  CLIENT: 'CLIENT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  VALIDATION: 'VALIDATION_ERROR'
};

// Custom error class for API errors
export class APIError extends Error {
  constructor(message, type, status, retryable = false) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.status = status;
    this.retryable = retryable;
    this.timestamp = new Date();
  }
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2
};

// Calculate delay for retry with exponential backoff
const calculateRetryDelay = (attempt) => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

// Check if error is retryable
const isRetryableError = (error) => {
  if (error instanceof APIError) {
    return error.retryable;
  }
  
  // Network errors are usually retryable
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }
  
  // 5xx errors are retryable, 4xx errors are not
  if (error.status >= 500) {
    return true;
  }
  
  return false;
};

// Enhanced fetch with retry logic
const fetchWithRetry = async (url, options = {}, retryCount = 0) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorType = ErrorTypes.UNKNOWN;
      let retryable = false;
      
      if (response.status >= 500) {
        errorType = ErrorTypes.SERVER;
        retryable = true;
      } else if (response.status === 429) {
        errorType = ErrorTypes.RATE_LIMIT;
        retryable = true;
      } else if (response.status >= 400) {
        errorType = ErrorTypes.CLIENT;
        retryable = false;
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        errorType,
        response.status,
        retryable
      );
    }
    
    return response;
  } catch (error) {
    // Handle timeout/abort
    if (error.name === 'AbortError') {
      throw new APIError(
        'Request timeout - server took too long to respond',
        ErrorTypes.NETWORK,
        408,
        true
      );
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new APIError(
        'Network error - please check your internet connection',
        ErrorTypes.NETWORK,
        0,
        true
      );
    }
    
    // If it's already an APIError, re-throw it
    if (error instanceof APIError) {
      throw error;
    }
    
    // For other errors, wrap them
    throw new APIError(
      error.message || 'An unexpected error occurred',
      ErrorTypes.UNKNOWN,
      0,
      false
    );
  }
};

// Retry wrapper
const withRetry = async (fetchFn, retryCount = 0) => {
  try {
    return await fetchFn();
  } catch (error) {
    if (retryCount >= RETRY_CONFIG.maxRetries || !isRetryableError(error)) {
      throw error;
    }
    
    const delay = calculateRetryDelay(retryCount);
    console.log(`Retrying request in ${delay}ms (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fetchFn, retryCount + 1);
  }
};

// API service functions
export const apiService = {
  // Fetch APOD data
  async fetchAPOD(date = null) {
    const endpoint = date ? `${API_BASE_URL}/apod?date=${date}` : `${API_BASE_URL}/apod`;
    
    return withRetry(async () => {
      const response = await fetchWithRetry(endpoint);
      const data = await response.json();
      
      if (!data.success) {
        throw new APIError(
          data.error?.message || 'Failed to fetch APOD data',
          ErrorTypes.SERVER,
          response.status,
          true
        );
      }
      
      return data.data;
    });
  },
  
  // Health check
  async healthCheck() {
    return withRetry(async () => {
      const response = await fetchWithRetry(`${API_BASE_URL.replace('/api', '')}/health`);
      return await response.json();
    });
  },
  
  // Validate date format
  validateDate(date) {
    if (!date) return { valid: true };
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new APIError(
        'Invalid date format. Please use YYYY-MM-DD format.',
        ErrorTypes.VALIDATION,
        400,
        false
      );
    }
    
    const selectedDate = new Date(date);
    const today = new Date();
    const minDate = new Date('1995-06-16');
    
    if (selectedDate > today) {
      throw new APIError(
        'Date cannot be in the future.',
        ErrorTypes.VALIDATION,
        400,
        false
      );
    }
    
    if (selectedDate < minDate) {
      throw new APIError(
        'Date must be after June 16, 1995 (APOD start date).',
        ErrorTypes.VALIDATION,
        400,
        false
      );
    }
    
    return { valid: true };
  }
};

// Network status detection
export const networkService = {
  isOnline() {
    return navigator.onLine;
  },
  
  addOnlineListener(callback) {
    window.addEventListener('online', callback);
    return () => window.removeEventListener('online', callback);
  },
  
  addOfflineListener(callback) {
    window.addEventListener('offline', callback);
    return () => window.removeEventListener('offline', callback);
  }
};

// Error message helpers
export const getErrorMessage = (error) => {
  if (error instanceof APIError) {
    switch (error.type) {
      case ErrorTypes.NETWORK:
        return 'Network connection issue. Please check your internet connection and try again.';
      case ErrorTypes.SERVER:
        return 'Server error. Please try again later.';
      case ErrorTypes.CLIENT:
        return error.message || 'Invalid request. Please check your input.';
      case ErrorTypes.RATE_LIMIT:
        return 'Too many requests. Please wait a moment and try again.';
      case ErrorTypes.VALIDATION:
        return error.message || 'Invalid input provided.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  
  return error.message || 'An unexpected error occurred.';
};

// Error logging (for debugging)
export const logError = (error, context = '') => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    message: error.message,
    type: error instanceof APIError ? error.type : 'UNKNOWN',
    status: error instanceof APIError ? error.status : null,
    stack: error.stack
  };
  
  console.error('API Error:', errorInfo);
  
  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
};

export default apiService;
