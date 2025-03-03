import React from "react";

export default function Privacy() {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-1 mb-6">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-8 prose prose-invert max-w-none">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Content Protection Notice</h2>
          <p className="text-muted-foreground whitespace-pre-line">
            ALL CONTENT ON THIS SITE IS ORIGINAL AND PROTECTED. UNAUTHORIZED REPRODUCTION, PLAGIARISM, OR COMMERCIAL TRANSLATION OF MY WORK IS STRICTLY PROHIBITED AND MAY RESULT IN LEGAL ACTION. IF YOU WISH TO SHARE OR USE ANY CONTENT, PLEASE OBTAIN PRIOR PERMISSION BY CONTACTING ME DIRECTLY.

            THANK YOU FOR YOUR SUPPORT, AND ENJOY THE STORIES.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Information We Collect</h2>
          <p className="text-muted-foreground">We may collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Account information (email, username)</li>
            <li>Profile information (optional)</li>
            <li>Content you submit (comments, stories)</li>
            <li>Usage data (how you interact with our site)</li>
            <li>Device information (browser type, IP address)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
          <p className="text-muted-foreground">We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Provide and improve our services</li>
            <li>Personalize your experience</li>
            <li>Communicate with you</li>
            <li>Monitor and analyze trends and usage</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Your Rights</h2>
          <p className="text-muted-foreground">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of certain data collection</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Contact Information</h2>
          <p className="text-muted-foreground">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="text-muted-foreground">
            Email: support@example.com
          </p>
        </section>
      </div>
    </div>
  );
}