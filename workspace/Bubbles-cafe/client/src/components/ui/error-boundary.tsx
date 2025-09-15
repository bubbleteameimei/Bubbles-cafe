import React, { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCcw, Home, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorTime?: number;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.log('ErrorBoundary caught error:', error);
    return { hasError: true, error, errorTime: Date.now() };
  }

  private cleanup?: () => void;
  private mounted: boolean = false;

  public componentDidMount() {
    this.mounted = true;
    const handleRouteChange = () => {
      if (this.mounted && this.state.hasError) {
        console.log('Route changed, resetting error state');
        this.setState({ 
          hasError: false, 
          error: undefined, 
          errorInfo: undefined,
          errorTime: undefined 
        });
      }
    };

    // Only listen for popstate events instead of patching history API
    // This is safer and won't interfere with routing libraries
    window.addEventListener('popstate', handleRouteChange);
    
    // Also check for hash changes which might indicate route changes
    window.addEventListener('hashchange', handleRouteChange);
    
    // For single page applications, monitor URL changes directly
    let lastPathname = window.location.pathname;
    
    // Set up a simple interval to check for URL changes
    // This avoids patching the history API which can cause compatibility issues
    const urlCheckInterval = setInterval(() => {
      const currentPathname = window.location.pathname;
      if (currentPathname !== lastPathname) {
        lastPathname = currentPathname;
        handleRouteChange();
      }
    }, 200);

    this.cleanup = () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
      clearInterval(urlCheckInterval);
    };
  }

  public componentWillUnmount() {
    this.mounted = false;
    if (this.cleanup) {
      this.cleanup();
    }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    if (this.mounted) {
      this.setState({
        error,
        errorInfo,
        errorTime: Date.now()
      });
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoBack = () => {
    window.history.back();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private getErrorMessage(error: Error): string {
    if (!error.message) return "An unexpected error occurred.";

    // Route/lazy loading specific errors
    if (error.message.includes('Lazy') || error.message.includes('loading')) {
      console.log('Route loading error:', error);
      return "There was an error loading this page component. Please refresh and try again.";
    }
    if (error.message.includes('chunk') || error.message.includes('failed to load')) {
      return "A required page component failed to load. This might be due to a network issue or recent update.";
    }
    if (error.message.includes('404')) {
      return "We couldn't find what you're looking for. The page might have been moved or deleted.";
    }
    if (error.message.includes('route') || error.message.includes('navigation')) {
      return "There was an error with page navigation. Please try going back or refreshing the page.";
    }
    if (error.message.includes('Suspense') || error.message.includes('suspended')) {
      return "The page component couldn't be loaded. This might be due to a temporary network issue.";
    }
    if (error.message.includes('database') || error.message.includes('bookmarks')) {
      return "There was an issue connecting to the database. Please try again later.";
    }

    return error.message || "An unexpected error occurred. We're looking into it.";
  }

  private formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    // Use inline error UI instead of dynamically importing to avoid cross-origin errors
    const errorMessage = this.getErrorMessage(this.state.error!);
    const errorTime = this.state.errorTime ? this.formatTime(this.state.errorTime) : '';
    
    // Import necessary fonts 
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Creepster&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');
    `;
    document.head.appendChild(styleElement);
    
    // Clean up when unmounted
    setTimeout(() => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    }, 100);

    // Inline ErrorPage component to avoid dynamic imports that can cause cross-origin errors
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-4" style={{
        background: 'linear-gradient(to bottom, rgba(10, 10, 10, 0.95), rgba(25, 25, 25, 0.98))',
        backdropFilter: 'blur(6px)'
      }}>
        <div className="eyeball-loader mb-8" style={{ position: 'relative' }}></div>
        
        <div className="max-w-xl shadow-lg border rounded-md p-4" style={{
          borderColor: 'rgba(220, 38, 38, 0.2)',
          backgroundColor: 'rgba(20, 20, 20, 0.9)'
        }}>
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mr-2 mt-1">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>
              <h2 className="text-lg mb-2 text-red-500" style={{
                fontFamily: "'Creepster', cursive",
                letterSpacing: '0.05em',
                textShadow: '1px 1px 3px rgba(255, 0, 0, 0.4)'
              }}>
                Something went wrong
              </h2>
              <div className="space-y-4">
                <p className="text-sm opacity-90" style={{
                  fontFamily: "'Special Elite', sans-serif",
                  letterSpacing: '0.02em'
                }}>
                  {errorMessage}
                </p>
                
                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <div className="space-y-2">
                    <p className="text-xs opacity-70" style={{
                      fontFamily: "'Special Elite', sans-serif",
                      letterSpacing: '0.02em'
                    }}>
                      Error occurred at: {errorTime}
                    </p>
                    <details className="text-xs">
                      <summary className="cursor-pointer hover:opacity-80" style={{
                        fontFamily: "'Special Elite', sans-serif",
                        letterSpacing: '0.02em'
                      }}>
                        Technical Details
                      </summary>
                      <pre className="mt-2 bg-black/20 p-2 rounded overflow-auto max-h-40 text-[10px] leading-tight whitespace-pre-wrap break-words">
                        {this.state.error && this.state.error.stack}
                      </pre>
                    </details>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={this.handleReload}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-700 hover:border-red-500 hover:text-red-500 transition-colors"
                    style={{
                      fontFamily: "'Special Elite', sans-serif",
                      letterSpacing: '0.02em'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 2v6h-6"></path>
                      <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                      <path d="M3 22v-6h6"></path>
                      <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                    </svg>
                    Try Again
                  </button>
                  <button
                    onClick={this.handleGoBack}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-700 hover:border-red-500 hover:text-red-500 transition-colors"
                    style={{
                      fontFamily: "'Special Elite', sans-serif",
                      letterSpacing: '0.02em'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 19-7-7 7-7"></path>
                      <path d="M19 12H5"></path>
                    </svg>
                    Go Back
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-700 hover:border-red-500 hover:text-red-500 transition-colors"
                    style={{
                      fontFamily: "'Special Elite', sans-serif",
                      letterSpacing: '0.02em'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    Go Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}