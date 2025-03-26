import React from 'react';
import ScrollEffectsDemo from '@/components/ScrollEffectsDemo';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

/**
 * Demo page that showcases the Multi-Speed Scroll and Global Gentle Return features.
 * This page provides UI elements to test both features and see them in action.
 */
const ScrollDemoPage: React.FC = () => {
  // Helper to create placeholder content for scrolling
  const createPlaceholderContent = (count: number) => {
    return Array.from({ length: count }).map((_, index) => (
      <div key={index} className="my-6">
        <h3 className="text-xl font-medium mb-2">Section {index + 1}</h3>
        <p className="text-muted-foreground mb-4">
          This is placeholder content to demonstrate the scrolling features. Scroll quickly
          through this content to see the fast scroll behavior, or drag slowly to see the
          gentle scroll behavior.
        </p>
        <p className="mb-3">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
          Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus
          rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna
          non est bibendum non venenatis nisl tempor.
        </p>
        {index % 3 === 0 && (
          <div className="bg-muted p-4 rounded-md my-4">
            <h4 className="font-medium mb-2">Try this:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Flick quickly to see fast scrolling</li>
              <li>Drag slowly to see gentle scrolling</li>
              <li>Refresh the page to see your position restored</li>
            </ul>
          </div>
        )}
      </div>
    ));
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    window.scrollTo({ 
      top: document.documentElement.scrollHeight, 
      behavior: 'smooth' 
    });
  };

  // Create a link that navigates away and back
  const navigateAwayAndBack = () => {
    // Save current URL
    const currentUrl = window.location.href;
    
    // Store it in session storage
    sessionStorage.setItem('returnUrl', currentUrl);
    
    // Navigate to home page
    window.location.href = '/';
    
    // Set up return after 2 seconds
    setTimeout(() => {
      window.location.href = currentUrl;
    }, 2000);
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Multi-Speed Scroll & Gentle Return Demo</h1>
      <p className="text-muted-foreground mb-6">
        This page demonstrates the adaptive scrolling and position restoration features.
      </p>

      <ScrollEffectsDemo />

      <Separator className="my-6" />

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Testing Controls</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={scrollToTop}>Scroll to Top</Button>
          <Button onClick={scrollToBottom} variant="outline">Scroll to Bottom</Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="secondary"
          >
            Refresh Page
          </Button>
          <Button
            onClick={navigateAwayAndBack}
            variant="default"
          >
            Navigate Away & Back
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="prose max-w-none">
        <h2>Multi-Speed Scroll</h2>
        <p>
          This feature makes scrolling feel more natural and intuitive by adapting the scroll
          speed based on your gesture:
        </p>
        <ul>
          <li><strong>Fast flick</strong>: Scrolls quickly with momentum (like throwing a page)</li>
          <li><strong>Slow drag</strong>: Scrolls gently with precision (like carefully moving a page)</li>
        </ul>
        <p>
          You'll notice subtle visual indicators appear on the right side of the screen when
          you're using different scroll speeds.
        </p>

        <h2>Global Gentle Return</h2>
        <p>
          This feature remembers your position on every page and smoothly restores it when you:
        </p>
        <ul>
          <li><strong>Refresh the page</strong>: Your position is restored with a special animation</li>
          <li><strong>Navigate away and back</strong>: Returns you to where you left off</li>
        </ul>
        <p>
          To test this feature, scroll down this page, then either refresh or use the buttons above
          to navigate away and back. You'll see your position is seamlessly restored.
        </p>
      </div>

      <Separator className="my-8" />

      <h2 className="text-2xl font-semibold mb-4">Scroll Testing Content</h2>
      <p className="text-muted-foreground mb-6">
        Scroll through the content below to test the Multi-Speed Scroll feature.
        Try both fast flicks and slow drags to see the difference.
      </p>

      {/* Generate placeholder content for scrolling */}
      {createPlaceholderContent(10)}

      <div className="sticky bottom-4 right-4 flex justify-end mt-8">
        <Button 
          onClick={scrollToTop}
          size="sm"
          className="shadow-lg"
        >
          Back to Top
        </Button>
      </div>
    </div>
  );
};

export default ScrollDemoPage;