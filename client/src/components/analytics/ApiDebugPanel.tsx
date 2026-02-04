import React, { useEffect, useState } from 'react';
import { getApiBaseUrl } from '@/lib/asset-path';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CorsDebugResponse {
  status: string;
  timestamp: string;
  origin: string | null;
  url: string;
  hostname: string;
  cors: {
    frontendUrl: string | null;
    isApiPath: boolean;
  };
}

export const ApiDebugPanel: React.FC = () => {
  const [apiBase, setApiBase] = useState<string>('');
  const [result, setResult] = useState<CorsDebugResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const base = getApiBaseUrl();
      setApiBase(base);
    } catch {
      setApiBase('');
    }
  }, []);

  const runCheck = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const base = apiBase || getApiBaseUrl();
      const url = `${base.replace(/\/+$/, '')}/api/debug/cors`;
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });
      const json = (await res.json().catch(() => null)) as CorsDebugResponse | null;
      if (!res.ok || !json) {
        throw new Error(`HTTP ${res.status}`);
      }
      setResult(json);
    } catch (e: any) {
      setError(e?.message || 'Failed to call /api/debug/cors');
    } finally {
      setLoading(false);
    }
  };

  if (!import.meta.env.DEV) {
    // Keep this dev-only; avoid showing in production accidentally
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[2147483646] max-w-sm text-xs">
      <Card className="p-3 bg-background/95 border border-dashed border-primary/40 shadow-lg space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold">API Diagnostics</span>
          <Button size="sm" variant="outline" onClick={runCheck} disabled={loading}>
            {loading ? 'Checking…' : 'Check CORS'}
          </Button>
        </div>
        <div className="space-y-1">
          <div className="truncate">Base: <code>{apiBase || '(auto)'}</code></div>
          {result && (
            <>
              <div className="truncate">Origin: <code>{String(result.origin ?? 'null')}</code></div>
              <div className="truncate">Worker sees: <code>{result.hostname}</code></div>
              <div className="truncate">Frontend URL: <code>{result.cors.frontendUrl ?? 'null'}</code></div>
            </>
          )}
          {error && <div className="text-red-500">Error: {error}</div>}
        </div>
      </Card>
    </div>
  );
};

export default ApiDebugPanel;
