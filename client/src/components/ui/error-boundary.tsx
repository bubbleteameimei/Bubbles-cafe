import { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
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

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private getErrorMessage(error: Error): string {
    if (error.message.includes('401')) {
      return "You are not authenticated. Please log in to continue.";
    }
    if (error.message.includes('403')) {
      return "You do not have permission to access this resource.";
    }
    if (error.message.includes('404')) {
      return "The requested resource was not found.";
    }
    if (error.message.includes('500')) {
      return "An unexpected server error occurred. Please try again later.";
    }
    return error.message || "An unexpected error occurred.";
  }

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.getErrorMessage(this.state.error!);
      const errorTime = new Date(this.state.errorTime!).toLocaleTimeString();

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-xl">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold mb-2">
              Something went wrong
            </AlertTitle>
            <AlertDescription className="space-y-4">
              <p className="text-sm opacity-90">
                {errorMessage}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <>
                  <p className="text-xs opacity-70">Error occurred at: {errorTime}</p>
                  <pre className="text-xs bg-black/10 p-2 rounded overflow-auto max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
              <div className="flex gap-2 mt-4">
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