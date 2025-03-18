import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import { useCookieConsent } from '@/hooks/use-cookie-consent';
import { CookieCategory } from '@/lib/cookie-manager';
import { AlertTriangle, Info, Loader2, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { usePrivacySettings } from '@/hooks/use-privacy-settings';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getPrivacyImpactLevel } from '@/utils/privacy-settings-utils';
import { Progress } from '@/components/ui/progress';

export default function PrivacySettingsPage() {
  const { 
    cookiePreferences, 
    toggleCategory, 
    acceptAll, 
    acceptEssentialOnly 
  } = useCookieConsent();
  
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const { 
    settings, 
    isLoading, 
    updateSetting, 
    isUpdating,
    isAuthReady: settingsAuthReady 
  } = usePrivacySettings();

  // Calculate privacy impact level based on current settings
  const privacyImpactLevel = useMemo(() => {
    if (isLoading || !settings) return 'medium';
    return getPrivacyImpactLevel(settings);
  }, [settings, isLoading]);

  // Calculate privacy score as a percentage (higher = more private)
  const privacyScore = useMemo(() => {
    if (isLoading || !settings) return 50;
    
    let score = 0;
    const totalFactors = 8; // Updated to match all the factors we're checking
    
    // Add points for each privacy-enhancing setting
    if (!settings.profileVisible) score += 1;
    if (!settings.shareReadingHistory) score += 1;
    if (settings.anonymousCommenting) score += 1;
    if (settings.twoFactorAuthEnabled) score += 1;
    if (settings.loginNotifications) score += 1;
    if (settings.dataRetentionPeriod <= 90) score += 1;
    if (!settings.activityTracking) score += 1;
    if (settings.emailNotifications) score += 1; // Notifications help with security alerts
    
    return Math.round((score / totalFactors) * 100);
  }, [settings, isLoading]);

  // Function to toggle a specific cookie category
  const handleToggleCategory = (category: CookieCategory) => {
    toggleCategory(category);
  };

  // Function to clear all non-essential cookies
  const handleClearAllCookies = () => {
    acceptEssentialOnly();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Privacy Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Privacy Controls</CardTitle>
          <CardDescription>Manage your privacy preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAuthReady && !isAuthenticated ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground mb-4">You must be logged in to manage your privacy settings.</p>
              <Link href="/login">
                <Button>Log in</Button>
              </Link>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="profile-visible">Public Profile Visibility</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Allow other users to view your profile including your reading history and authored stories</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Switch 
                  id="profile-visible" 
                  checked={settings.profileVisible}
                  disabled={isUpdating} 
                  onCheckedChange={(checked) => updateSetting('profileVisible', checked)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="reading-history">Share Reading History</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Allow the system to use your reading history for personalized recommendations</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Switch 
                  id="reading-history" 
                  checked={settings.shareReadingHistory}
                  disabled={isUpdating}
                  onCheckedChange={(checked) => updateSetting('shareReadingHistory', checked)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="anonymous-comments">Anonymous Commenting</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Hide your identity when posting comments on stories</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Switch 
                  id="anonymous-comments" 
                  checked={settings.anonymousCommenting}
                  disabled={isUpdating}
                  onCheckedChange={(checked) => updateSetting('anonymousCommenting', checked)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="two-factor-auth">Two-Factor Authentication</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Enable 2FA for additional account security</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Switch 
                  id="two-factor-auth" 
                  checked={settings.twoFactorAuthEnabled}
                  disabled={isUpdating}
                  onCheckedChange={(checked) => updateSetting('twoFactorAuthEnabled', checked)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="login-notifications">Login Notifications</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Receive notifications when your account is accessed from a new device</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Switch 
                  id="login-notifications" 
                  checked={settings.loginNotifications}
                  disabled={isUpdating}
                  onCheckedChange={(checked) => updateSetting('loginNotifications', checked)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Receive email notifications about new stories, comments, and site features</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Switch 
                  id="email-notifications" 
                  checked={settings.emailNotifications}
                  disabled={isUpdating}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="activity-tracking">Activity Tracking</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Allow tracking of your activity on the site for improved functionality</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Switch 
                  id="activity-tracking" 
                  checked={settings.activityTracking}
                  disabled={isUpdating}
                  onCheckedChange={(checked) => updateSetting('activityTracking', checked)} 
                />
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="data-retention">Data Retention Period</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">How long we keep your activity data before automatically deleting it</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select 
                  value={settings.dataRetentionPeriod.toString()} 
                  onValueChange={(value) => updateSetting('dataRetentionPeriod', parseInt(value))}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-6">
                <Button variant="destructive">
                  Delete Account Data
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {isAuthReady && isAuthenticated && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Privacy Impact Summary</CardTitle>
            <CardDescription>Understanding how your settings affect your privacy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Privacy Protection Score</h3>
                <span className="text-sm font-medium">{privacyScore}%</span>
              </div>
              <Progress value={privacyScore} className="h-2" />
              
              <div className="flex gap-3 mt-4">
                {privacyImpactLevel === 'low' ? (
                  <div className="flex-1 rounded-md border p-3 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <div className="flex gap-2 items-center">
                      <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h4 className="font-medium text-green-700 dark:text-green-300">High Privacy</h4>
                    </div>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                      Your current settings prioritize privacy. You've made choices that minimize data collection and visibility.
                    </p>
                  </div>
                ) : privacyImpactLevel === 'medium' ? (
                  <div className="flex-1 rounded-md border p-3 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                    <div className="flex gap-2 items-center">
                      <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <h4 className="font-medium text-amber-700 dark:text-amber-300">Balanced Privacy</h4>
                    </div>
                    <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                      Your settings balance privacy with functionality. Consider reviewing settings to increase protection if desired.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 rounded-md border p-3 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                    <div className="flex gap-2 items-center">
                      <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <h4 className="font-medium text-red-700 dark:text-red-300">Reduced Privacy</h4>
                    </div>
                    <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                      Your settings prioritize functionality over privacy. This increases data collection and visibility of your activity.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                <h4 className="font-medium mb-2">Privacy Tips</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Enable two-factor authentication for extra account security</li>
                  <li>Keep login notifications on to detect unauthorized access</li>
                  <li>Anonymous commenting helps protect your identity</li>
                  <li>Limiting data retention reduces long-term data exposure</li>
                  <li>Disabling activity tracking prevents detailed usage analysis</li>
                  <li>Be cautious with profile visibility to control who can see your information</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cookie Management</CardTitle>
          <CardDescription>Control what cookies are used on this site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            <p>
              Cookies help us deliver the best experience. By using our website, you agree to the use of essential cookies. 
              You can customize which optional cookies you allow below.
            </p>
            <div className="mt-2 flex items-center gap-2 p-2 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <AlertTriangle size={18} />
              <p className="text-xs font-medium">
                Essential cookies cannot be disabled as they are required for the website to function properly.
              </p>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="essential-cookies">
              <AccordionTrigger className="flex justify-between">
                <div className="flex items-center justify-between w-full pr-4">
                  <div>
                    <span className="font-medium">Essential Cookies</span>
                  </div>
                  <Switch 
                    checked={true} 
                    disabled 
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Essential cookies are necessary for the website to function properly. They enable basic functionality such as 
                page navigation and access to secure areas of the website. The website cannot function properly without these cookies.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="functional-cookies">
              <AccordionTrigger className="flex justify-between">
                <div className="flex items-center justify-between w-full pr-4">
                  <div>
                    <span className="font-medium">Functional Cookies</span>
                  </div>
                  <Switch 
                    checked={cookiePreferences.functional} 
                    onCheckedChange={() => handleToggleCategory('functional')}
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Functional cookies help perform certain functionalities like sharing the content of the website on 
                social media platforms or collecting feedback. These cookies help us improve website functionality 
                and personalize your experience.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="analytics-cookies">
              <AccordionTrigger className="flex justify-between">
                <div className="flex items-center justify-between w-full pr-4">
                  <div>
                    <span className="font-medium">Analytics Cookies</span>
                  </div>
                  <Switch 
                    checked={cookiePreferences.analytics} 
                    onCheckedChange={() => handleToggleCategory('analytics')}
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Analytics cookies help website owners understand how visitors interact with websites by collecting and 
                reporting information anonymously. These cookies allow us to count visits and traffic sources, so we can 
                measure and improve the performance of our site.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="performance-cookies">
              <AccordionTrigger className="flex justify-between">
                <div className="flex items-center justify-between w-full pr-4">
                  <div>
                    <span className="font-medium">Performance Cookies</span>
                  </div>
                  <Switch 
                    checked={cookiePreferences.performance} 
                    onCheckedChange={() => handleToggleCategory('performance')}
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Performance cookies are used to enhance the performance and functionality of our website but are non-essential 
                to their use. These cookies collect information about how you use our website, such as which pages you visit most 
                often and if you receive error messages.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="marketing-cookies">
              <AccordionTrigger className="flex justify-between">
                <div className="flex items-center justify-between w-full pr-4">
                  <div>
                    <span className="font-medium">Marketing Cookies</span>
                  </div>
                  <Switch 
                    checked={cookiePreferences.marketing} 
                    onCheckedChange={() => handleToggleCategory('marketing')}
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Marketing cookies are used to track visitors across websites to display relevant advertisements that are 
                engaging and valuable to visitors. These cookies help make advertising more relevant to you and your interests.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="flex flex-col">
            <Link href="/legal/cookie-policy" className="text-sm text-primary hover:underline">
              View Cookie Policy
            </Link>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClearAllCookies}>
              Clear All Cookies
            </Button>
            <Button onClick={acceptAll}>
              Accept All Cookies
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>Export your personal data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You can request a copy of your personal data in a machine-readable format.
            This includes your profile information, reading history, comments, and other data associated with your account.
          </p>
          <Link href="/settings/data-export">
            <Button>
              Export My Data
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
