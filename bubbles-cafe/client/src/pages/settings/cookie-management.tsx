'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCookieConsent } from '@/hooks/use-cookie-consent';
import { CookieCategory } from '@/lib/cookie-manager';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, ArrowLeft, CheckCircle2, CookingPot, Cookie, ExternalLink, Info, Lock, Shield, Terminal, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Loader } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export default function CookieManagementPage() {
  const { cookiePreferences, toggleCategory, acceptAll, acceptEssentialOnly, allCookies } = useCookieConsent();
  const { isAuthenticated, isAuthReady } = useAuth();
  const [selectedTab, setSelectedTab] = useState('preferences');
  const [isClearingCookies, setIsClearingCookies] = useState(false);

  // Function to toggle a specific cookie category
  const handleToggleCategory = (category: CookieCategory) => {
    toggleCategory(category);
  };

  // Function to clear all non-essential cookies
  const handleClearAllCookies = () => {
    setIsClearingCookies(true);
    
    // Simulate the delay of clearing cookies
    setTimeout(() => {
      acceptEssentialOnly();
      setIsClearingCookies(false);
    }, 800);
  };

  // Generate cookie list from cookie store
  const cookiesList = Object.entries(allCookies || {}).map(([name, value]) => ({
    name,
    value: typeof value === 'string' ? value : JSON.stringify(value),
    category: getCookieCategory(name),
    expiry: getCookieExpiry(name)
  }));

  // Helper function to determine cookie category (simplified example)
  function getCookieCategory(name: string): CookieCategory {
    if (name.includes('_sess') || name === 'connect.sid' || name === 'XSRF-TOKEN') {
      return 'essential';
    } else if (name.includes('_pref') || name.includes('theme') || name.includes('font')) {
      return 'functional';
    } else if (name.includes('_ga') || name.includes('_gid') || name.includes('_analytics')) {
      return 'analytics';
    } else if (name.includes('_ad') || name.includes('fbp') || name.includes('_gcl')) {
      return 'marketing';
    }
    return 'essential'; // Default to essential if unknown
  }

  // Simplified expiry date retriever (would be replaced with actual implementation)
  function getCookieExpiry(name: string): string {
    // In a real implementation, we would get the actual expiry date from the cookie
    if (name.includes('_sess') || name === 'connect.sid') {
      return 'Session';
    } else if (name.includes('_pref') || name.includes('theme')) {
      return '1 year';
    } else if (name.includes('_ga')) {
      return '2 years';
    }
    return 'Unknown';
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <Link href="/settings/privacy">
          <Button variant="ghost" size="sm" className="gap-1 transition-all duration-200 hover:translate-x-[-4px]">
            <ArrowLeft size={16} />
            <span>Back to Privacy Settings</span>
          </Button>
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10 bg-gradient-to-r from-primary/5 to-transparent p-6 rounded-lg border border-border/30">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Cookie size={28} className="text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Cookie Management</h1>
          <p className="text-muted-foreground max-w-2xl">
            Control how cookies are used when you browse this website. Essential cookies are always enabled as they're required for the website to function properly.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="mb-6 flex flex-wrap gap-2 xs:gap-0 xs:inline-flex h-auto xs:h-11 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground overflow-x-auto">
          <TabsTrigger value="preferences" className="flex items-center gap-2 rounded-md px-2 xs:px-4 py-2 text-xs xs:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground">
            <Shield size={14} />
            <span>Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="browser" className="flex items-center gap-2 rounded-md px-2 xs:px-4 py-2 text-xs xs:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground">
            <Terminal size={14} />
            <span>Browser</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2 rounded-md px-2 xs:px-4 py-2 text-xs xs:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground">
            <Info size={14} />
            <span>About</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cookie Preferences</CardTitle>
              <CardDescription>Control what cookies are used on this site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="warning" className="mb-4">
                <AlertCircle size={16} className="mr-2" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Essential cookies cannot be disabled as they are required for the website to function properly.
                </AlertDescription>
              </Alert>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="essential-cookies" className="border rounded-md my-3 overflow-hidden bg-muted/10 border-primary/20">
                  <AccordionTrigger className="flex justify-between py-4 px-2 xs:px-5 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between w-full pr-0 xs:pr-4">
                      <div className="flex items-center gap-2 xs:gap-3">
                        <div className="h-7 w-7 xs:h-9 xs:w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Lock size={14} className="text-primary" />
                        </div>
                        <div>
                          <span className="font-medium block text-sm xs:text-base">Essential Cookies</span>
                          <span className="text-xs text-muted-foreground hidden xs:inline">For site functionality</span>
                        </div>
                        <Badge variant="secondary" className="ml-1 text-xs">Required</Badge>
                      </div>
                      <div className="flex-shrink-0">
                        <Switch 
                          checked={true} 
                          disabled 
                          className="data-[state=checked]:bg-primary/70"
                        />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground bg-muted/5 border-t px-5 py-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <p className="mb-3">
                          Essential cookies are necessary for the website to function properly. They enable basic functionality such as 
                          page navigation and access to secure areas of the website. The website cannot function properly without these cookies.
                        </p>
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-foreground">Use cases:</p>
                          <ul className="list-disc pl-5 text-xs mt-1 space-y-1">
                            <li>Keeping you logged in during your visit</li>
                            <li>Remembering your preferences</li>
                            <li>Security features and CSRF protection</li>
                          </ul>
                        </div>
                      </div>
                      <div className="sm:w-1/3 flex flex-col justify-center items-center bg-muted/20 rounded-md p-4">
                        <CheckCircle2 size={24} className="text-primary/80 mb-2" />
                        <p className="text-center text-xs font-medium">Always active</p>
                        <p className="text-center text-xs text-muted-foreground mt-1">These cookies are necessary</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="functional-cookies" className="border rounded-md my-3 overflow-hidden">
                  <AccordionTrigger className="flex justify-between py-4 px-2 xs:px-5 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between w-full pr-0 xs:pr-4">
                      <div className="flex items-center gap-2 xs:gap-3">
                        <div className="h-7 w-7 xs:h-9 xs:w-9 rounded-full bg-muted/80 flex items-center justify-center flex-shrink-0">
                          <CookingPot size={14} className="text-foreground" />
                        </div>
                        <div>
                          <span className="font-medium block text-sm xs:text-base">Functional Cookies</span>
                          <span className="text-xs text-muted-foreground hidden xs:inline">For enhanced features</span>
                        </div>
                        <Badge variant="outline" className="ml-1 text-xs">Optional</Badge>
                      </div>
                      <div className="flex-shrink-0">
                        <Switch 
                          checked={cookiePreferences.functional} 
                          onCheckedChange={() => handleToggleCategory('functional')}
                          className="data-[state=checked]:bg-primary/70"
                        />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground bg-muted/5 border-t px-5 py-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <p className="mb-3">
                          Functional cookies help perform certain functionalities like sharing the content of the website on 
                          social media platforms or collecting feedback. These cookies help us improve website functionality 
                          and personalize your experience.
                        </p>
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-foreground">Examples:</p>
                          <ul className="list-disc pl-5 text-xs mt-1 space-y-1">
                            <li>Theme and appearance preferences</li>
                            <li>Language settings</li>
                            <li>Reading position memory</li>
                          </ul>
                        </div>
                      </div>
                      <div className="sm:w-1/3 flex flex-col justify-center items-center bg-muted/20 rounded-md p-4">
                        {cookiePreferences.functional ? (
                          <>
                            <CheckCircle2 size={24} className="text-green-500 mb-2" />
                            <p className="text-center text-xs font-medium">Currently active</p>
                          </>
                        ) : (
                          <>
                            <Cookie size={24} className="text-muted-foreground mb-2 opacity-70" />
                            <p className="text-center text-xs font-medium">Currently inactive</p>
                          </>
                        )}
                        <p className="text-center text-xs text-muted-foreground mt-1">Toggle to change</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="analytics-cookies" className="border rounded-md my-3 overflow-hidden">
                  <AccordionTrigger className="flex justify-between py-4 px-2 xs:px-5 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between w-full pr-0 xs:pr-4">
                      <div className="flex items-center gap-2 xs:gap-3">
                        <div className="h-7 w-7 xs:h-9 xs:w-9 rounded-full bg-muted/80 flex items-center justify-center flex-shrink-0">
                          <Terminal size={14} className="text-foreground" />
                        </div>
                        <div>
                          <span className="font-medium block text-sm xs:text-base">Analytics Cookies</span>
                          <span className="text-xs text-muted-foreground hidden xs:inline">For site improvements</span>
                        </div>
                        <Badge variant="outline" className="ml-1 text-xs">Optional</Badge>
                      </div>
                      <div className="flex-shrink-0">
                        <Switch 
                          checked={cookiePreferences.analytics} 
                          onCheckedChange={() => handleToggleCategory('analytics')}
                          className="data-[state=checked]:bg-primary/70"
                        />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground bg-muted/5 border-t px-5 py-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <p className="mb-3">
                          Analytics cookies help us understand how visitors interact with our website. The information collected 
                          is aggregated and anonymous. It helps us improve the website and your browsing experience.
                        </p>
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-foreground">Examples:</p>
                          <ul className="list-disc pl-5 text-xs mt-1 space-y-1">
                            <li>Page view statistics</li>
                            <li>User journey tracking</li>
                            <li>Performance metrics</li>
                          </ul>
                        </div>
                      </div>
                      <div className="sm:w-1/3 flex flex-col justify-center items-center bg-muted/20 rounded-md p-4">
                        {cookiePreferences.analytics ? (
                          <>
                            <CheckCircle2 size={24} className="text-green-500 mb-2" />
                            <p className="text-center text-xs font-medium">Currently active</p>
                          </>
                        ) : (
                          <>
                            <Cookie size={24} className="text-muted-foreground mb-2 opacity-70" />
                            <p className="text-center text-xs font-medium">Currently inactive</p>
                          </>
                        )}
                        <p className="text-center text-xs text-muted-foreground mt-1">Toggle to change</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="marketing-cookies" className="border rounded-md my-3 overflow-hidden">
                  <AccordionTrigger className="flex justify-between py-4 px-2 xs:px-5 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between w-full pr-0 xs:pr-4">
                      <div className="flex items-center gap-2 xs:gap-3">
                        <div className="h-7 w-7 xs:h-9 xs:w-9 rounded-full bg-muted/80 flex items-center justify-center flex-shrink-0">
                          <ExternalLink size={14} className="text-foreground" />
                        </div>
                        <div>
                          <span className="font-medium block text-sm xs:text-base">Marketing Cookies</span>
                          <span className="text-xs text-muted-foreground hidden xs:inline">For personalized ads</span>
                        </div>
                        <Badge variant="outline" className="ml-1 text-xs">Optional</Badge>
                      </div>
                      <div className="flex-shrink-0">
                        <Switch 
                          checked={cookiePreferences.marketing} 
                          onCheckedChange={() => handleToggleCategory('marketing')}
                          className="data-[state=checked]:bg-primary/70"
                        />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground bg-muted/5 border-t px-5 py-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <p className="mb-3">
                          Marketing cookies are used to track visitors across websites to display relevant advertisements. 
                          These cookies help make advertising more engaging to users and more valuable to publishers and advertisers.
                        </p>
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-foreground">Examples:</p>
                          <ul className="list-disc pl-5 text-xs mt-1 space-y-1">
                            <li>Remarketing and retargeting</li>
                            <li>Conversion tracking</li>
                            <li>Ad impression metrics</li>
                          </ul>
                        </div>
                      </div>
                      <div className="sm:w-1/3 flex flex-col justify-center items-center bg-muted/20 rounded-md p-4">
                        {cookiePreferences.marketing ? (
                          <>
                            <CheckCircle2 size={24} className="text-green-500 mb-2" />
                            <p className="text-center text-xs font-medium">Currently active</p>
                          </>
                        ) : (
                          <>
                            <Cookie size={24} className="text-muted-foreground mb-2 opacity-70" />
                            <p className="text-center text-xs font-medium">Currently inactive</p>
                          </>
                        )}
                        <p className="text-center text-xs text-muted-foreground mt-1">Toggle to change</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter className="flex flex-col gap-6 items-start pt-6 border-t">
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full">
                <Button 
                  variant="outline" 
                  onClick={handleClearAllCookies}
                  disabled={isClearingCookies}
                  className="flex items-center gap-2 px-3 sm:px-4 py-4 sm:py-6 h-auto sm:flex-1 hover:bg-muted/90 transition-colors"
                >
                  <div className="rounded-full bg-destructive/10 p-1.5 sm:p-2 flex-shrink-0">
                    {isClearingCookies ? (
                      <Loader size={16} className="animate-spin text-destructive" />
                    ) : (
                      <Trash2 size={16} className="text-destructive" />
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm sm:text-base">
                      {isClearingCookies ? "Clearing..." : "Clear Optional Cookies"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Removes non-essential cookies
                    </span>
                  </div>
                </Button>
                <Button 
                  onClick={acceptAll}
                  className="flex items-center gap-2 px-3 sm:px-4 py-4 sm:py-6 h-auto sm:flex-1 bg-primary/90 hover:bg-primary transition-colors"
                >
                  <div className="rounded-full bg-white/20 p-1.5 sm:p-2 flex-shrink-0">
                    <Cookie size={16} className="text-white" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm sm:text-base">
                      Accept All Cookies
                    </span>
                    <span className="text-xs text-primary-foreground/80">
                      Enable all categories
                    </span>
                  </div>
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 w-full rounded-md p-3">
                <Info size={16} className="text-primary/70 flex-shrink-0" />
                <p>Your cookie preferences will be saved for 1 year. You can change them at any time by visiting this page.</p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="browser" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Browser Cookies</CardTitle>
              <CardDescription>View and manage cookies stored by this site in your browser</CardDescription>
            </CardHeader>
            <CardContent>
              {cookiesList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Cookie size={32} className="mx-auto mb-4 opacity-40" />
                  <p>No cookies found for this domain</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-2 px-2">
                  <Table className="w-full">
                    <TableCaption className="text-xs sm:text-sm">List of cookies currently stored in your browser for this domain.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/2 md:w-auto">Name</TableHead>
                        <TableHead className="w-1/4 md:w-auto">Category</TableHead>
                        <TableHead className="w-1/4 md:w-auto">Expiry</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cookiesList.map((cookie) => (
                        <TableRow key={cookie.name}>
                          <TableCell className="font-mono text-xs break-words max-w-[120px] xs:max-w-none">{cookie.name}</TableCell>
                          <TableCell>
                            <Badge variant={cookie.category === 'essential' ? 'secondary' : 'outline'} className="text-xs whitespace-nowrap">
                              {cookie.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">{cookie.expiry}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  onClick={handleClearAllCookies}
                  disabled={isClearingCookies}
                  className="flex items-center gap-2 px-3 sm:px-4 py-4 sm:py-5 h-auto hover:bg-muted/90 transition-colors"
                >
                  <div className="rounded-full bg-destructive/10 p-1.5 sm:p-2 flex-shrink-0">
                    {isClearingCookies ? (
                      <Loader size={16} className="animate-spin text-destructive" />
                    ) : (
                      <Trash2 size={16} className="text-destructive" />
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm sm:text-base">
                      {isClearingCookies ? "Clearing..." : "Clear Optional Cookies"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Removes non-essential cookies
                    </span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Browser Cookie Settings</CardTitle>
              <CardDescription>Learn how to manage cookies in your browser</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                In addition to the cookie preferences on this website, you can also control cookies through your browser settings.
                Here's how to manage cookies in popular browsers:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4">
                <div className="p-3 xs:p-4 border rounded-md bg-muted/5 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-2 xs:gap-3 mb-2">
                    <div className="h-7 w-7 xs:h-9 xs:w-9 rounded-full bg-[#4285F4]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#4285F4] font-bold text-xs xs:text-base">C</span>
                    </div>
                    <h3 className="font-medium text-sm xs:text-base">Google Chrome</h3>
                  </div>
                  <p className="text-xs xs:text-sm text-muted-foreground">
                    Settings → Privacy and security → Cookies and other site data
                  </p>
                </div>
                
                <div className="p-3 xs:p-4 border rounded-md bg-muted/5 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-2 xs:gap-3 mb-2">
                    <div className="h-7 w-7 xs:h-9 xs:w-9 rounded-full bg-[#FF9500]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#FF9500] font-bold text-xs xs:text-base">F</span>
                    </div>
                    <h3 className="font-medium text-sm xs:text-base">Mozilla Firefox</h3>
                  </div>
                  <p className="text-xs xs:text-sm text-muted-foreground">
                    Options → Privacy & Security → Cookies and Site Data
                  </p>
                </div>
                
                <div className="p-3 xs:p-4 border rounded-md bg-muted/5 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-2 xs:gap-3 mb-2">
                    <div className="h-7 w-7 xs:h-9 xs:w-9 rounded-full bg-[#0D6EFD]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#0D6EFD] font-bold text-xs xs:text-base">S</span>
                    </div>
                    <h3 className="font-medium text-sm xs:text-base">Safari</h3>
                  </div>
                  <p className="text-xs xs:text-sm text-muted-foreground">
                    Preferences → Privacy → Cookies and website data
                  </p>
                </div>
                
                <div className="p-3 xs:p-4 border rounded-md bg-muted/5 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-2 xs:gap-3 mb-2">
                    <div className="h-7 w-7 xs:h-9 xs:w-9 rounded-full bg-[#00A4EF]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#00A4EF] font-bold text-xs xs:text-base">E</span>
                    </div>
                    <h3 className="font-medium text-sm xs:text-base">Microsoft Edge</h3>
                  </div>
                  <p className="text-xs xs:text-sm text-muted-foreground">
                    Settings → Cookies and site permissions → Cookies and site data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About Cookies</CardTitle>
              <CardDescription>Learn what cookies are and how they're used</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm sm:text-base mb-2">What Are Cookies?</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Cookies are small text files that websites place on your device to store information. 
                  They help make websites work more efficiently and provide information to website owners.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm sm:text-base mb-2">How We Use Cookies</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  We use cookies to understand how visitors use our website, remember your preferences, 
                  and improve your experience. Some cookies are necessary for the website to function, 
                  while others enhance performance and functionality.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm sm:text-base mb-2">Types of Cookies We Use</h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded-md">
                    <h4 className="font-medium text-sm xs:text-base mb-1">Essential Cookies</h4>
                    <p className="text-xs xs:text-sm text-muted-foreground">
                      Required for the website to function properly. They enable basic functionality such as 
                      page navigation and access to secure areas.
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <h4 className="font-medium text-sm xs:text-base mb-1">Functional Cookies</h4>
                    <p className="text-xs xs:text-sm text-muted-foreground">
                      Help perform certain functionalities like sharing content on 
                      social media, collecting feedback, and other features.
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <h4 className="font-medium text-sm xs:text-base mb-1">Analytics Cookies</h4>
                    <p className="text-xs xs:text-sm text-muted-foreground">
                      Help us understand how visitors interact with our website. Information is 
                      aggregated and anonymous, helping improve your experience.
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <h4 className="font-medium text-sm xs:text-base mb-1">Marketing Cookies</h4>
                    <p className="text-xs xs:text-sm text-muted-foreground">
                      Used to track visitors across websites to display relevant advertisements that are 
                      engaging to users and valuable to publishers.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex flex-col gap-2">
                <Link href="/legal/cookie-policy" className="text-sm text-primary hover:underline flex items-center gap-1">
                  <Terminal size={14} />
                  View Full Cookie Policy
                </Link>
                <Link href="/legal/privacy" className="text-sm text-primary hover:underline flex items-center gap-1">
                  <Shield size={14} />
                  View Privacy Policy
                </Link>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}