import { motion } from "framer-motion";
import React from "react";

export default function CookiePolicy() {
  return (
    <motion.div 
      className="container max-w-4xl mx-auto px-6 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-card shadow-sm border border-border rounded-xl p-8 md:p-10">
        <h1 className="text-4xl font-bold mb-10 text-center pb-4 border-b border-border">Cookie Policy</h1>

        <div className="prose dark:prose-invert max-w-none space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">What Are Cookies</h2>
            <p className="leading-relaxed text-muted-foreground tracking-wide">Cookies are small text files that are stored on your computer or mobile device when you visit a website. They allow the website to recognize your device and remember if you've been to the website before.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">How We Use Cookies</h2>
            <p className="leading-relaxed text-muted-foreground tracking-wide mb-4">We use cookies to enhance your experience on our website, including:</p>
            <ul className="list-disc pl-8 space-y-3 text-muted-foreground">
              <li className="pl-2">Remembering your preferences and settings</li>
              <li className="pl-2">Keeping you signed in</li>
              <li className="pl-2">Understanding how you use our website</li>
              <li className="pl-2">Improving our content and functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">Types of Cookies We Use</h2>
            <ul className="list-disc pl-8 space-y-3 text-muted-foreground">
              <li className="pl-2"><strong className="text-foreground">Essential cookies:</strong> Required for the website to function properly</li>
              <li className="pl-2"><strong className="text-foreground">Functionality cookies:</strong> Remember choices you make to improve your experience</li>
              <li className="pl-2"><strong className="text-foreground">Analytics cookies:</strong> Help us understand how visitors interact with our website</li>
              <li className="pl-2"><strong className="text-foreground">Performance cookies:</strong> Collect information about how you use our website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">Managing Cookies</h2>
            <p className="leading-relaxed text-muted-foreground tracking-wide mb-4">Most web browsers allow you to control cookies through their settings. You can usually find these settings in the "options" or "preferences" menu of your browser.</p>
            <p className="leading-relaxed text-muted-foreground tracking-wide">Please note that if you choose to disable cookies, some features of our website may not function properly.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">Changes to This Cookie Policy</h2>
            <p className="leading-relaxed text-muted-foreground tracking-wide">We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page.</p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}