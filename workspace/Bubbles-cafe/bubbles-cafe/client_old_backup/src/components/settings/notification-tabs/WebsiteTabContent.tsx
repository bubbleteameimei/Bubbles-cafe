import { memo } from 'react';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { CardHeader, CardContent, CardTitle, CardDescription, Card } from '@/components/ui/card';

const WebsiteTabContent = () => (
  <SettingsSection
    title="Browser Notifications"
    description="Manage notifications that appear in your browser while using the site."
    includeSeparator={false}
  >
    <Card>
      <CardHeader>
        <CardTitle>Browser Notifications</CardTitle>
        <CardDescription>
          Configure which notifications appear in your browser
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Browser notifications are currently disabled for this browser. 
          Click "Enable Notifications" to receive updates while browsing the site.
        </p>
        <div className="bg-muted p-4 rounded-md mb-4">
          <p className="text-sm font-medium">Permission Required</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your browser requires permission to show notifications. 
            Please accept the prompt when it appears.
          </p>
        </div>
      </CardContent>
    </Card>
  </SettingsSection>
);

export default memo(WebsiteTabContent);