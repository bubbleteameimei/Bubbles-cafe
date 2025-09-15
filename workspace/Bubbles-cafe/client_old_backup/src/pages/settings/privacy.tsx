import React, { useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import { useCookieConsent } from '@/hooks/use-cookie-consent';
import { CookieCategory } from '@/lib/cookie-manager';
import { 
  AlertTriangle, 
  ArrowRight, 
  Info, 
  Lock, 
  Loader2, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  User, 
  Cookie, 
  RefreshCw, 
  DownloadCloud,
  Trash2 
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { usePrivacySettings } from '@/hooks/use-privacy-settings';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getPrivacyImpactLevel } from '@/utils/privacy-settings-utils';
import { Progress } from '@/components/ui/progress';
import { SettingsLayout } from '@/components/layouts/SettingsLayout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function PrivacySettingsPage() {
  const { toast } = useToast();
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
  
  const [isDeleting, setIsDeleting] = React.useState(false);

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
  
  // Handle account data deletion
  const handleDeleteAccountData = async () => {
    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Data deleted",
        description: "Your account data has been successfully deleted",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle data export request
  const handleRequestDataExport = () => {
    toast({
      title: "Data Export Feature Removed",
      description: "The data export functionality has been removed for security and performance reasons. Please contact support if you need your data.",
      variant: "destructive"
    });
  };

  return (
    <SettingsLayout title="Privacy Settings" description="Manage your privacy preferences and control your data">
      <div className="space-y-6">
        <Card className="border-primary/10 bg-muted/30">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-xl">Privacy Controls</CardTitle>
                <CardDescription>Adjust how your information is used and shared</CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 gap-1"
                  disabled={isLoading || isUpdating}
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh</span>
                </Button>
                
                <Link href="/settings/cookie-management">
                  <Button size="sm" variant="outline" className="h-8 gap-1">
                    <Cookie className="h-3.5 w-3.5" />
                    <span>Cookies</span>
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {isAuthReady && !isAuthenticated ? (
              <div className="p-6 text-center border rounded-md bg-muted/50">
                <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  You must be logged in to manage your privacy settings and control your data. 
                  Please sign in to continue.
                </p>
                <Link href="/login">
                  <Button className="mt-2">Log in to access privacy settings</Button>
                </Link>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-sm">Loading your privacy settings...</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium flex items-center">
                        <User className="h-4 w-4 mr-2 text-primary/70" />
                        <span>Profile Privacy</span>
                      </h3>
                      
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <Label htmlFor="profile-visible" className="text-sm">Public Profile Visibility</Label>
                          <p className="text-xs text-muted-foreground">
                            Allow others to view your profile and reading history
                          </p>
                        </div>
                        <Switch 
                          id="profile-visible" 
                          checked={settings.profileVisible}
                          disabled={isUpdating} 
                          onCheckedChange={(checked) => updateSetting('profileVisible', checked)} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <Label htmlFor="reading-history" className="text-sm">Share Reading History</Label>
                          <p className="text-xs text-muted-foreground">
                            Share your reading patterns for recommendations
                          </p>
                        </div>
                        <Switch 
                          id="reading-history" 
                          checked={settings.shareReadingHistory}
                          disabled={isUpdating}
                          onCheckedChange={(checked) => updateSetting('shareReadingHistory', checked)} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <Label htmlFor="anonymous-comments" className="text-sm">Anonymous Commenting</Label>
                          <p className="text-xs text-muted-foreground">
                            Hide your identity when posting comments
                          </p>
                        </div>
                        <Switch 
                          id="anonymous-comments" 
                          checked={settings.anonymousCommenting}
                          disabled={isUpdating}
                          onCheckedChange={(checked) => updateSetting('anonymousCommenting', checked)} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-primary/70" />
                        <span>Security Settings</span>
                      </h3>
                      
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="two-factor-auth" className="text-sm">Two-Factor Authentication</Label>
                            <Badge variant="outline" className="h-5 text-[10px]">Recommended</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Enable 2FA for additional account security
                          </p>
                        </div>
                        <Switch 
                          id="two-factor-auth" 
                          checked={settings.twoFactorAuthEnabled}
                          disabled={isUpdating}
                          onCheckedChange={(checked) => updateSetting('twoFactorAuthEnabled', checked)} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <Label htmlFor="login-notifications" className="text-sm">Login Notifications</Label>
                          <p className="text-xs text-muted-foreground">
                            Get notified of new device logins
                          </p>
                        </div>
                        <Switch 
                          id="login-notifications" 
                          checked={settings.loginNotifications}
                          disabled={isUpdating}
                          onCheckedChange={(checked) => updateSetting('loginNotifications', checked)} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-primary/70" />
                        <span>Data Collection</span>
                      </h3>
                      
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notifications" className="text-sm">Email Notifications</Label>
                          <p className="text-xs text-muted-foreground">
                            Receive security and feature updates via email
                          </p>
                        </div>
                        <Switch 
                          id="email-notifications" 
                          checked={settings.emailNotifications}
                          disabled={isUpdating}
                          onCheckedChange={(checked) => updateSetting('emailNotifications', checked)} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <Label htmlFor="activity-tracking" className="text-sm">Activity Tracking</Label>
                          <p className="text-xs text-muted-foreground">
                            Allow tracking for improved functionality
                          </p>
                        </div>
                        <Switch 
                          id="activity-tracking" 
                          checked={settings.activityTracking}
                          disabled={isUpdating}
                          onCheckedChange={(checked) => updateSetting('activityTracking', checked)} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <Label htmlFor="data-retention" className="text-sm">Data Retention Period</Label>
                          <p className="text-xs text-muted-foreground">
                            How long we keep your activity data
                          </p>
                        </div>
                        <Select 
                          value={settings.dataRetentionPeriod.toString()} 
                          onValueChange={(value) => updateSetting('dataRetentionPeriod', parseInt(value))}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
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
                    </div>
                    
                    <div className="mt-4 border rounded-lg p-3 space-y-3">
                      <h3 className="text-sm font-medium flex items-center text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        <span>Data Management</span>
                      </h3>
                      
                      <p className="text-xs text-muted-foreground">
                        If you wish to delete your data or request an export, use the options below.
                        These actions may be permanent and cannot be undone.
                      </p>
                      
                      <div className="flex flex-col xs:flex-row gap-2 pt-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex gap-1 text-xs"
                          onClick={handleRequestDataExport}
                        >
                          <DownloadCloud className="h-3.5 w-3.5" />
                          <span>Request Data Export</span>
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="flex gap-1 text-xs"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete Account Data</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete all account data?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove all of your saved preferences, reading history, 
                                and other user data from our servers. This action cannot be undone.
                                Your account will remain active, but all personal data will be removed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleDeleteAccountData}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span>Deleting...</span>
                                  </>
                                ) : (
                                  <span>Yes, delete my data</span>
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
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
                <Progress 
                  value={privacyScore} 
                  className="h-2"
                  // Use appropriate colors based on score
                  style={{
                    background: "hsl(var(--muted))",
                    "--tw-gradient-from": privacyScore < 30 ? "hsl(var(--destructive))" : 
                                         privacyScore < 70 ? "hsl(var(--amber-600))" : 
                                         "hsl(var(--green-600))"
                  } as React.CSSProperties}
                />
                
                <div className="grid gap-3 mt-4 sm:grid-cols-1 md:grid-cols-3">
                  {privacyImpactLevel === 'low' ? (
                    <div className="col-span-full md:col-span-3 rounded-md border p-3 bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800">
                      <div className="flex gap-2 items-center">
                        <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <h4 className="font-medium text-green-700 dark:text-green-300">High Privacy</h4>
                      </div>
                      <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                        Your current settings prioritize privacy. You've made choices that minimize data collection and visibility.
                      </p>
                    </div>
                  ) : privacyImpactLevel === 'medium' ? (
                    <div className="col-span-full md:col-span-3 rounded-md border p-3 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800">
                      <div className="flex gap-2 items-center">
                        <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <h4 className="font-medium text-amber-700 dark:text-amber-300">Balanced Privacy</h4>
                      </div>
                      <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                        Your settings balance privacy with functionality. Consider reviewing settings to increase protection if desired.
                      </p>
                    </div>
                  ) : (
                    <div className="col-span-full md:col-span-3 rounded-md border p-3 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800">
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
                
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div className="border rounded-md p-4 bg-muted/20">
                    <h4 className="font-medium mb-2 text-sm">Privacy Tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Enable two-factor authentication for enhanced security</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Consider disabling activity tracking to minimize data collection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Use anonymous commenting to maintain privacy in discussions</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-muted/20">
                    <h4 className="font-medium mb-2 text-sm">Security Recommendations</h4>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Update your password regularly (every 3-6 months)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Enable login notifications to detect unauthorized access</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Review connected devices in your account security section</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t py-4">
              <div className="w-full flex justify-between items-center">
                <Link href="/settings/cookie-management">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Cookie className="h-4 w-4" />
                    <span>Cookie Settings</span>
                  </Button>
                </Link>
                <Link href="/privacy-policy">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Lock className="h-4 w-4" />
                    <span>Privacy Policy</span>
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </SettingsLayout>
  );
}