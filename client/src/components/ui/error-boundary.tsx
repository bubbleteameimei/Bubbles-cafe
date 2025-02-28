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
    return { hasError: true, error, errorTime: Date.now() };
  }

  private cleanup?: () => void;
  private mounted: boolean = false;

  public componentDidMount() {
    this.mounted = true;
    const handleRouteChange = () => {
      if (this.mounted && this.state.hasError) {
        this.setState({ 
          hasError: false, 
          error: undefined, 
          errorInfo: undefined,
          errorTime: undefined 
        });
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      const result = originalPushState.apply(this, args);
      handleRouteChange();
      return result;
    };

    window.history.replaceState = function(...args) {
      const result = originalReplaceState.apply(this, args);
      handleRouteChange();
      return result;
    };

    this.cleanup = () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }

  public componentWillUnmount() {
    this.mounted = false;
    if (this.cleanup) {
      this.cleanup();
    }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
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

    if (error.message.includes('Suspense') || error.message.includes('loading')) {
      return "There was an error loading this page component. Please refresh and try again.";
    }
    if (error.message.includes('chunk') || error.message.includes('failed to load')) {
      return "A required page component failed to load. This might be due to a network issue or recent update.";
    }
    if (error.message.includes('404')) {
      return "We couldn't find what you're looking for. The page might have been moved or deleted.";
    }
    if (error.message.includes('500')) {
      return "Something went wrong on our end. We're working on fixing it. Please try again later.";
    }
    if (error.message.includes('network')) {
      return "Unable to connect to the server. Please check your internet connection and try again.";
    }
    if (error.message.includes('route') || error.message.includes('navigation')) {
      return "There was an error with page navigation. Please try going back or refreshing the page.";
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

    // Use custom fallback if provided
    if (this.props.fallback) {
      return this.props.fallback;
    }

    const errorMessage = this.getErrorMessage(this.state.error!);
    const errorTime = this.state.errorTime ? this.formatTime(this.state.errorTime) : '';

    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm">
        <Alert variant="destructive" className="max-w-xl shadow-lg">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold mb-2">
            Something went wrong
          </AlertTitle>
          <AlertDescription className="space-y-4">
            <p className="text-sm opacity-90">
              {errorMessage}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <div className="space-y-2">
                <p className="text-xs opacity-70">Error occurred at: {errorTime}</p>
                <details className="text-xs">
                  <summary className="cursor-pointer hover:opacity-80">Technical Details</summary>
                  <pre className="mt-2 bg-black/10 p-2 rounded overflow-auto max-h-40 text-[10px] leading-tight whitespace-pre-wrap break-words">
                    {this.state.error?.stack}
                    {"\n\nComponent Stack:"}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant="outline"
                onClick={this.handleReload}
                className="flex items-center gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}