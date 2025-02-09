import { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCcw, Home, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface Props {
  children: ReactNode;
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

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
      errorTime: Date.now()
    });
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
    if (error.message.includes('401')) {
      return "You need to be logged in to access this page. Please log in and try again.";
    }
    if (error.message.includes('403')) {
      return "You don't have permission to access this page. Please contact the administrator if you believe this is a mistake.";
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
    if (error.message.includes('chunk')) {
      return "There was an error loading this page. Please refresh and try again.";
    }
    return "An unexpected error occurred. We're looking into it.";
  }

  private formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.getErrorMessage(this.state.error!);
      const errorTime = this.formatTime(this.state.errorTime!);

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
                    <pre className="mt-2 bg-black/10 p-2 rounded overflow-auto max-h-40 text-[10px] leading-tight">
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

    return this.props.children;
  }
}