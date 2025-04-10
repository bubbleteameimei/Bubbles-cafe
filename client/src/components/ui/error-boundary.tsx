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

    // Import the error page component lazily to avoid causing another error during error rendering
    const ErrorPage = require('./error-page').default;
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

    return (
      <ErrorPage 
        title="Something went wrong"
        message={errorMessage}
        error={this.state.error}
        showDetails={process.env.NODE_ENV === 'development' && !!this.state.errorInfo}
        showActions={true}
        onRetry={this.handleReload}
        onGoBack={this.handleGoBack}
        onGoHome={this.handleGoHome}
      />
    );
  }
}