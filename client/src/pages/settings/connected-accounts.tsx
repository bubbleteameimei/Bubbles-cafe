import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SiGoogle, SiGithub, SiDiscord, SiGhost } from 'react-icons/si';
import { AiOutlineTwitter } from 'react-icons/ai';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from '@/components/ui/spinner';

export default function ConnectedAccountsPage() {
  const { checkAuth } = useAuth();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [connecting, setConnecting] = React.useState<Record<string, boolean>>({});
  const [connections, setConnections] = React.useState({
    google: false,
    twitter: false,
    github: false,
    discord: false,
    ghost: false
  });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch('/api/auth/connections', { credentials: 'include' });
        if (!resp.ok) throw new Error('Failed to load connections');
        const data = await resp.json();
        if (!cancelled && data?.providers) {
          setConnections(prev => ({ ...prev, ...data.providers }));
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true };
  }, []);

  const handleConnect = async (platform: keyof typeof connections) => {
    try {
      if (platform !== 'google') return;
      if (connections.google) {
        // Disconnect flow
        setConnecting(prev => ({ ...prev, [platform]: true }));
        const resp = await fetch('/api/auth/disconnect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ provider: 'google' })
        });
        setConnecting(prev => ({ ...prev, [platform]: false }));
        if (!resp.ok) throw new Error('Failed to disconnect');
        setConnections(prev => ({ ...prev, google: false }));
        await checkAuth();
        return;
      }

      setConnecting(prev => ({ ...prev, [platform]: true }));
      const { signInWithGoogle } = await import('@/lib/firebase');
      const user = await signInWithGoogle();
      if (!user?.email) throw new Error('Google sign-in failed: missing email');
      const resp = await fetch('/api/auth/social-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          providerId: (user as any).uid,
          provider: 'google',
          email: (user as any).email,
          displayName: (user as any).displayName,
          photoURL: (user as any).photoURL
        })
      });
      setConnecting(prev => ({ ...prev, [platform]: false }));
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to connect Google account');
      }
      setConnections(prev => ({ ...prev, google: true }));
      await checkAuth();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      alert('Connection failed: ' + msg);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Connected Accounts</h1>

      <Card>
        <CardHeader>
          <CardTitle>Social Connections</CardTitle>
          <CardDescription>Link your social accounts for enhanced features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Spinner size="sm" /> Loading connections...
            </div>
          )}
          <div className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-lg transition-colors">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-accent rounded-lg">
                <SiGoogle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Google</p>
                <p className="text-sm text-muted-foreground">
                  {connections.google ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            <Button
              variant={connections.google ? "destructive" : "default"}
              onClick={() => handleConnect('google')}
              disabled={!!connecting.google}
            >
              {connecting.google ? 'Please wait…' : (connections.google ? 'Disconnect' : 'Connect')}
            </Button>
          </div>

          <div className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-lg transition-colors">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-accent rounded-lg">
                <AiOutlineTwitter className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Twitter/X</p>
                <p className="text-sm text-muted-foreground">
                  {connections.twitter ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            <Button variant="outline" disabled title="Twitter/X integration coming soon">
              Coming soon
            </Button>
          </div>

          <div className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-lg transition-colors">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-accent rounded-lg">
                <SiGithub className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">GitHub</p>
                <p className="text-sm text-muted-foreground">
                  {connections.github ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            <Button variant="outline" disabled title="GitHub integration coming soon">
              Coming soon
            </Button>
          </div>

          <div className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-lg transition-colors">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-accent rounded-lg">
                <SiDiscord className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Discord</p>
                <p className="text-sm text-muted-foreground">
                  {connections.discord ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            <Button variant="outline" disabled title="Discord integration coming soon">
              Coming soon
            </Button>
          </div>

          <div className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-lg transition-colors">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-accent rounded-lg">
                <SiGhost className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium">Ghost Blog</p>
                <p className="text-sm text-muted-foreground">
                  {connections.ghost ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            <Button variant="outline" disabled title="Ghost integration coming soon">
              Coming soon
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>Manage third-party applications with access to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">You haven't authorized any applications yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}