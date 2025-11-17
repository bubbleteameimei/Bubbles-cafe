import React from "react";

export default function CookiePolicy() {
  return (
    <>
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight">Cookie Policy</h1>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none text-base leading-7">
          <section>
            <h2>What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device by websites you visit. They help the site remember your preferences and improve your experience.
            </p>
          </section>

          <section>
            <h2>How We Use Cookies</h2>
            <p>We use cookies to:</p>
            <ul>
              <li>Remember your preferences and settings</li>
              <li>Keep you signed in</li>
              <li>Understand how you use our website</li>
              <li>Improve our content and functionality</li>
            </ul>
          </section>

          <section>
            <h2>Types of Cookies We Use</h2>
            <ul>
              <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
              <li><strong>Functionality cookies:</strong> Remember choices you make to improve your experience</li>
              <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Performance cookies:</strong> Collect information about how you use our website</li>
            </ul>
          </section>

          <section>
            <h2>Managing Cookies</h2>
            <p>Most web browsers allow you to control cookies through their settings (often found in “Options” or “Preferences”).</p>
            <p>If you disable cookies, some features of our website may not function properly.</p>
          </section>

          <section>
            <h2>Changes to This Cookie Policy</h2>
            <p>We may update this Cookie Policy from time to time. We will post any changes on this page.</p>
          </section>
        </div>
      </div>
    </>
  );
}