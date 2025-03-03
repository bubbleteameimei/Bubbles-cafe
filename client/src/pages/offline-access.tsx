import React from "react";
import { Button } from "@/components/ui/button";

export default function OfflineAccess() {
  // This function would handle the actual downloading/caching for offline use
  const handleEnableOfflineAccess = () => {
    // Implementation would depend on your service worker strategy
    alert("Offline access enabled! Stories will be available offline when you're connected.");
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-1 mb-6">
        <h1 className="text-3xl font-bold">Offline Access</h1>
      </div>

      <div className="space-y-8 prose prose-invert max-w-none">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Read Anywhere, Anytime</h2>
          <p className="text-muted-foreground">
            Our offline access feature allows you to enjoy your favorite horror stories even when you don't have an internet connection. Whether you're in a remote cabin in the woods, on a plane, or simply experiencing a network outage, your reading experience continues uninterrupted.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">How It Works</h2>
          <p className="text-muted-foreground">
            When you enable offline access, we use your browser's storage capabilities to save the stories you've recently viewed. The next time you open our app without an internet connection, these stories will be available for you to read.
          </p>
          <p className="text-muted-foreground">
            Remember that while offline, you won't be able to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Access new stories you haven't viewed before</li>
            <li>See new comments or interact with the community</li>
            <li>Sync your reading progress across devices</li>
          </ul>
          <p className="text-muted-foreground">
            Your offline library will automatically update when you're back online.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Enable Offline Access</h2>
          <p className="text-muted-foreground">
            Click the button below to enable offline access. You'll need to be online when you first enable this feature, and we recommend periodically connecting to refresh your offline library.
          </p>
          <div className="mt-4">
            <Button onClick={handleEnableOfflineAccess}>
              Enable Offline Access
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This feature requires a modern browser that supports service workers and cache storage.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Managing Storage</h2>
          <p className="text-muted-foreground">
            Offline stories use storage space on your device. By default, we limit this to a reasonable amount to avoid taking too much space. If you need to free up space, you can clear your browser's cache or disable offline access from your account settings.
          </p>
        </section>
      </div>
    </div>
  );
}