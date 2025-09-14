
import React from 'react';
import { Link } from 'wouter';
import '@/styles/eyeball-loader.css';

interface SimplifiedErrorPageProps {
  statusCode: number;
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
  showDetails?: boolean;
  onRetry?: () => void;
}

const SimplifiedErrorPage: React.FC<SimplifiedErrorPageProps> = ({
  statusCode,
  title,
  message,
  actionText = "Go Home",
  actionLink = "/",
  showDetails = false,
  onRetry
}) => {
  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f0f0f 50%, #1a1a1a 75%, #0a0a0a 100%)',
        color: '#ffffff'
      }}
    >
      {/* Eyeball loader animation */}
      <div className="eyeball-loader" style={{ marginBottom: '2rem' }}></div>
      
      {/* Error content */}
      <div style={{ maxWidth: '600px' }}>
        <h1 style={{ 
          fontSize: '4rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          fontFamily: 'Megrim'
        }}>
          {statusCode}
        </h1>
        
        <h2 style={{ 
          fontSize: '2rem', 
          marginBottom: '1rem',
          fontFamily: 'Megrim'
        }}>
          {title}
        </h2>
        
        <p style={{ 
          fontSize: '1.2rem', 
          marginBottom: '2rem',
          opacity: 0.8
        }}>
          {message}
        </p>
        
        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href={actionLink}>
            <button style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textDecoration: 'none'
            }}>
              {actionText}
            </button>
          </Link>
          
          {onRetry && (
            <button 
              onClick={onRetry}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '2px solid #ffffff',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Try Again
            </button>
          )}
        </div>
        
        {showDetails && (
          <details style={{ marginTop: '2rem', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '1rem' }}>
              Technical Details
            </summary>
            <pre style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              overflow: 'auto'
            }}>
              {JSON.stringify({ statusCode, title, message }, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default SimplifiedErrorPage;
