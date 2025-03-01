import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SiGoogle, SiTwitter, SiGithub, SiDiscord } from 'react-icons/si';

export default function ConnectedAccountsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Connected Accounts</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Social Connections</CardTitle>
          <CardDescription>Manage your connected social accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SiGoogle className="h-5 w-5" />
              <span>Google</span>
            </div>
            <Button variant="outline">Connect</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SiTwitter className="h-5 w-5" />
              <span>Twitter</span>
            </div>
            <Button variant="outline">Connect</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SiGithub className="h-5 w-5" />
              <span>GitHub</span>
            </div>
            <Button variant="outline">Connect</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SiDiscord className="h-5 w-5" />
              <span>Discord</span>
            </div>
            <Button variant="outline">Connect</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
