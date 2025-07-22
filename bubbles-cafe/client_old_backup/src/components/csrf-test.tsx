/**
 * CSRF Test Component
 * 
 * This component provides a simple interface to test CSRF protection
 * by making GET and POST requests to the CSRF test endpoints.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createCSRFRequest } from '@/lib/csrf-token';

interface CsrfTestResult {
  method: string;
  success: boolean;
  message: string;
  csrfToken?: string;
  receivedToken?: string;
  sessionToken?: string;
}

export default function CsrfTest() {
  const [results, setResults] = useState<CsrfTestResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Function to make a GET request to the test endpoint (should succeed)
  const testGet = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/csrf-test', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      setResults(prev => [
        {
          method: 'GET',
          success: data.success,
          message: data.message,
          csrfToken: data.csrfToken,
          sessionToken: data.sessionToken
        },
        ...prev
      ]);
    } catch (error) {
      setResults(prev => [
        {
          method: 'GET',
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Function to make a POST request with CSRF token (should succeed)
  const testPostWithToken = async () => {
    setLoading(true);
    try {
      const options = createCSRFRequest('POST', { test: 'data' });
      const response = await fetch('/api/csrf-test', options);
      const data = await response.json();
      setResults(prev => [
        {
          method: 'POST (with token)',
          success: data.success,
          message: data.message,
          receivedToken: data.receivedToken,
          sessionToken: data.sessionToken
        },
        ...prev
      ]);
    } catch (error) {
      setResults(prev => [
        {
          method: 'POST (with token)',
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Function to make a POST request without CSRF token (should fail)
  const testPostWithoutToken = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/csrf-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: 'data' }),
        credentials: 'include',
      });
      
      // Parse response even if it's an error
      const data = await response.json();
      
      setResults(prev => [
        {
          method: 'POST (without token)',
          success: response.ok,
          message: data.message || data.error || 'Request failed',
          ...data
        },
        ...prev
      ]);
    } catch (error) {
      setResults(prev => [
        {
          method: 'POST (without token)',
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Function to make a POST request to a bypass endpoint (should succeed)
  const testPostBypass = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/csrf-test-bypass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: 'data' }),
        credentials: 'include',
      });
      const data = await response.json();
      setResults(prev => [
        {
          method: 'POST (bypass endpoint)',
          success: data.success,
          message: data.message,
          sessionToken: data.sessionToken
        },
        ...prev
      ]);
    } catch (error) {
      setResults(prev => [
        {
          method: 'POST (bypass endpoint)',
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>CSRF Protection Test</CardTitle>
          <CardDescription>
            Test Cross-Site Request Forgery (CSRF) protection implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <Button onClick={testGet} disabled={loading}>
              Test GET Request
            </Button>
            <Button onClick={testPostWithToken} disabled={loading}>
              Test POST with Token
            </Button>
            <Button onClick={testPostWithoutToken} disabled={loading} variant="outline">
              Test POST without Token
            </Button>
            <Button onClick={testPostBypass} disabled={loading} variant="secondary">
              Test Bypass Endpoint
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>
            Most recent test appears at the top
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-center text-muted-foreground">No tests run yet</p>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{result.method}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        result.success
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      }`}
                    >
                      {result.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <p className="text-sm mt-2">{result.message}</p>
                  
                  {/* Show token details if available */}
                  {(result.csrfToken || result.receivedToken || result.sessionToken) && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {result.csrfToken && (
                        <div>CSRF Token: {result.csrfToken}</div>
                      )}
                      {result.receivedToken && (
                        <div>Received Token: {result.receivedToken}</div>
                      )}
                      {result.sessionToken && (
                        <div>Session Token: {result.sessionToken}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setResults([])}
            disabled={results.length === 0}
          >
            Clear Results
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}