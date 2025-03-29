import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SiGoogle, SiGithub, SiDiscord, SiGhost } from 'react-icons/si';
import { AiOutlineTwitter } from 'react-icons/ai';

export default function ConnectedAccountsPage() {
  const [connections, setConnections] = React.useState({
    google: false,
    twitter: false,
    github: false,
    discord: false,
    ghost: false
  });

  const handleConnect = (platform: keyof typeof connections) => {
    // TODO: Implement actual OAuth connection logic
    setConnections(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
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
            >
              {connections.google ? 'Disconnect' : 'Connect'}
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
            <Button
              variant={connections.twitter ? "destructive" : "default"}
              onClick={() => handleConnect('twitter')}
            >
              {connections.twitter ? 'Disconnect' : 'Connect'}
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
            <Button
              variant={connections.github ? "destructive" : "default"}
              onClick={() => handleConnect('github')}
            >
              {connections.github ? 'Disconnect' : 'Connect'}
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
            <Button
              variant={connections.discord ? "destructive" : "default"}
              onClick={() => handleConnect('discord')}
            >
              {connections.discord ? 'Disconnect' : 'Connect'}
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
            <Button
              variant={connections.ghost ? "destructive" : "default"}
              onClick={() => handleConnect('ghost')}
            >
              {connections.ghost ? 'Disconnect' : 'Connect'}
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