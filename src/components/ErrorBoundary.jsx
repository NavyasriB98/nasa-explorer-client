import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            maxWidth: '600px',
            background: 'white',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            border: '1px solid #e9ecef'
          }}>
            {/* Error Icon */}
            <div style={{
              fontSize: '4rem',
              marginBottom: '20px',
              color: '#dc3545'
            }}>
              ⚠️
            </div>

            {/* Error Title */}
            <h2 style={{
              fontSize: '2rem',
              color: '#dc3545',
              marginBottom: '15px',
              fontWeight: '600'
            }}>
              Something went wrong
            </h2>

            {/* Error Message */}
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              marginBottom: '25px',
              lineHeight: '1.6'
            }}>
              We encountered an unexpected error while loading the application. 
              This might be a temporary issue.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginBottom: '25px',
                textAlign: 'left',
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#495057',
                  marginBottom: '10px'
                }}>
                  Error Details (Development)
                </summary>
                <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                  <p><strong>Error:</strong> {this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <pre style={{
                      backgroundColor: '#e9ecef',
                      padding: '10px',
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '0.8rem'
                    }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                🔄 Try Again
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#545b62'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
              >
                🔄 Reset
              </button>

              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1e7e34'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
              >
                🔄 Reload Page
              </button>
            </div>

            {/* Retry Count */}
            {this.state.retryCount > 0 && (
              <p style={{
                marginTop: '20px',
                fontSize: '0.9rem',
                color: '#6c757d'
              }}>
                Retry attempts: {this.state.retryCount}
              </p>
            )}

            {/* Contact Support */}
            <div style={{
              marginTop: '30px',
              padding: '20px',
              backgroundColor: '#e7f3ff',
              borderRadius: '8px',
              border: '1px solid #b3d9ff'
            }}>
              <p style={{
                margin: '0',
                fontSize: '0.9rem',
                color: '#0066cc'
              }}>
                <strong>Still having issues?</strong> Please check your internet connection 
                or try refreshing the page. If the problem persists, the service might be temporarily unavailable.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 