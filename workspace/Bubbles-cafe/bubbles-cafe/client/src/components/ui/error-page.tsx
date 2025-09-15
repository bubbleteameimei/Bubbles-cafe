import React, { useEffect } from 'react';
import { AlertCircle, RefreshCcw, Home, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import '../../styles/eyeball-loader.css';

interface ErrorPageProps {
  title?: string;
  message?: string;
  error?: Error;
  showDetails?: boolean;
  showActions?: boolean;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  error,
  showDetails = false,
  showActions = true,
  onRetry = () => window.location.reload(),
  onGoBack = () => window.history.back(),
  onGoHome = () => window.location.href = '/',
}) => {
  // Add horror styles to the document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .horror-error-title {
        font-family: 'Creepster', cursive !important;
        letter-spacing: 0.05em;
        text-shadow: 1px 1px 3px rgba(255, 0, 0, 0.4);
      }
      
      .horror-error-text {
        font-family: 'Special Elite', cursive !important;
        letter-spacing: 0.02em;
      }
      
      .horror-error-button {
        font-family: 'Special Elite', cursive !important;
        letter-spacing: 0.02em;
        transition: all 0.3s ease;
      }
      
      .horror-error-button:hover {
        border-color: rgba(220, 38, 38, 0.5);
        color: rgb(220, 38, 38);
      }
      
      .horror-error-container {
        background: linear-gradient(to bottom, rgba(10, 10, 10, 0.95), rgba(25, 25, 25, 0.98));
        backdrop-filter: blur(6px);
      }
      
      .horror-error-card {
        border-color: rgba(220, 38, 38, 0.2);
        background-color: rgba(20, 20, 20, 0.9);
      }
    `;
    document.head.appendChild(styleElement);
    
    // Clean up when component unmounts
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-4 horror-error-container">
      {/* Eyeball Loader */}
      <div className="eyeball-loader mb-8"></div>
      
      <Alert variant="destructive" className="max-w-xl shadow-lg horror-error-card border">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <AlertTitle className="text-lg mb-2 horror-error-title text-red-500">
          {title}
        </AlertTitle>
        <AlertDescription className="space-y-4">
          <p className="text-sm opacity-90 horror-error-text">
            {message}
          </p>
          
          {showDetails && error && (
            <div className="space-y-2">
              <p className="text-xs opacity-70 horror-error-text">
                Error occurred at: {new Date().toLocaleTimeString()}
              </p>
              <details className="text-xs">
                <summary className="cursor-pointer hover:opacity-80 horror-error-text">
                  Technical Details
                </summary>
                <pre className="mt-2 bg-black/20 p-2 rounded overflow-auto max-h-40 text-[10px] leading-tight whitespace-pre-wrap break-words">
                  {error.stack}
                </pre>
              </details>
            </div>
          )}
          
          {showActions && (
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant="outline"
                onClick={onRetry}
                className="flex items-center gap-2 horror-error-button"
              >
                <RefreshCcw className="h-4 w-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={onGoBack}
                className="flex items-center gap-2 horror-error-button"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button
                variant="outline"
                onClick={onGoHome}
                className="flex items-center gap-2 horror-error-button"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ErrorPage;