import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/layout/footer";

export default function CookiePolicy() {
  return (
    <>
      <div className="container max-w-5xl mx-auto py-12 px-4">
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight">Cookie Policy</h1>
        </div>

        <Card className="bg-card/95 border border-border/60 shadow-sm">
          <CardContent className="p-6 space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">What Are Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files stored on your device by websites you visit. They help the site remember your preferences and improve your experience.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">How We Use Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">We use cookies to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                <li>Remember your preferences and settings</li>
                <li>Keep you signed in</li>
                <li>Understand how you use our website</li>
                <li>Improve our content and functionality</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Types of Cookies We Use</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
                <li><strong>Functionality cookies:</strong> Remember choices you make to improve your experience</li>
                <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our website</li>
                <li><strong>Performance cookies:</strong> Collect information about how you use our website</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Managing Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">Most web browsers allow you to control cookies through their settings (often found in “Options” or “Preferences”).</p>
              <p className="text-muted-foreground leading-relaxed">If you disable cookies, some features of our website may not function properly.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Changes to This Cookie Policy</h2>
              <p className="text-muted-foreground leading-relaxed">We may update this Cookie Policy from time to time. We will post any changes on this page.</p>
            </section>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}