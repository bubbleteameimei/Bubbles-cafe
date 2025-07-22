/**
 * CSRF Test Page
 * 
 * This page serves as a sandbox for testing the CSRF protection implementation.
 * It provides various ways to test if CSRF tokens are being properly generated,
 * validated, and enforced on the API endpoints.
 */
import CsrfTest from '@/components/csrf-test';

export default function CsrfTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">CSRF Protection Test</h1>
      <p className="mb-8 text-muted-foreground">
        This page is used to test the Cross-Site Request Forgery (CSRF) protection implementation.
        The test component below allows you to make different types of requests to verify that
        the CSRF protection is working correctly.
      </p>
      
      <CsrfTest />
    </div>
  );
}