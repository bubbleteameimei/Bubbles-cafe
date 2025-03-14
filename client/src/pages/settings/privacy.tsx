import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import { useCookieConsent } from '@/hooks/use-cookie-consent';
import { CookieCategory } from '@/lib/cookie-manager';
import { AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function PrivacySettingsPage() {
  const { 
    cookiePreferences, 
    toggleCategory, 
    acceptAll, 
    acceptEssentialOnly 
  } = useCookieConsent();

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
          <div className="flex items-center justify-between">
            <Label htmlFor="profile-visible">Public Profile Visibility</Label>
            <Switch id="profile-visible" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="reading-history">Share Reading History</Label>
            <Switch id="reading-history" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="anonymous-comments">Anonymous Commenting</Label>
            <Switch id="anonymous-comments" />
          </div>
          
          <div className="mt-6">
            <Button variant="destructive">
              Delete Account Data
            </Button>
          </div>
        </CardContent>
      </Card>

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
                    className="data-[state=checked]:bg-primary"
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
                    className="data-[state=checked]:bg-primary"
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
                    className="data-[state=checked]:bg-primary"
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
                    className="data-[state=checked]:bg-primary"
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
                    className="data-[state=checked]:bg-primary"
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
          <Button>
            Export My Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
