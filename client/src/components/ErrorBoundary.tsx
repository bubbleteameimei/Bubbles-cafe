import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public static defaultProps = {
    fallback: null
  };

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
          <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="mb-4 text-muted-foreground">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={this.handleRetry}>
                Try again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
              >
                Go to homepage
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;