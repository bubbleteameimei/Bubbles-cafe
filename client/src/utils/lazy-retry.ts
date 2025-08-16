import React from 'react';

export function lazyWithRetry<T extends React.ComponentType<any>>(
        importer: () => Promise<{ default: T }>,
        retries: number = 2,
        delayMs: number = 300
): React.LazyExoticComponent<T> {
        return React.lazy(async () => {
                let lastError: unknown = null;
                for (let attempt = 0; attempt <= retries; attempt++) {
                        try {
                                return await importer();
                        } catch (error) {
                                console.warn(`[LazyRetry] Attempt ${attempt + 1} failed:`, error);
                                lastError = error;
                                if (attempt === retries) break;
                                await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
                        }
                }
                
                // Create a detailed error with context
                const finalError = lastError instanceof Error 
                        ? new Error(`Failed to load component after ${retries + 1} attempts: ${lastError.message}`)
                        : new Error(`Failed to load component after ${retries + 1} attempts`);
                
                console.error('[LazyRetry] Component loading failed completely:', finalError);
                
                // Emit a custom event for the global error handler
                if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('lazy-load-error', {
                                detail: { error: finalError, attempts: retries + 1 }
                        }));
                }
                
                throw finalError;
        });
}