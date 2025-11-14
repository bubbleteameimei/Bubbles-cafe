import React from "react";
import Footer from "@/components/layout/footer";

export default function Privacy() {
  return (
    <div className="container max-w-5xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mt-1">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-10">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Content Protection Notice</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            ALL CONTENT ON THIS SITE IS ORIGINAL AND PROTECTED. UNAUTHORIZED REPRODUCTION, PLAGIARISM, OR COMMERCIAL TRANSLATION OF MY WORK IS STRICTLY PROHIBITED AND MAY RESULT IN LEGAL ACTION. IF YOU WISH TO SHARE OR USE ANY CONTENT, PLEASE OBTAIN PRIOR PERMISSION BY CONTACTING ME DIRECTLY.

            THANK YOU FOR YOUR SUPPORT, AND ENJOY THE STORIES.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">We may collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
            <li>Account information (email, username)</li>
            <li>Profile information (optional)</li>
            <li>Content you submit (comments, stories)</li>
            <li>Usage data (how you interact with our site)</li>
            <li>Device information (browser type, IP address)</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed">We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
            <li>Provide and improve our services</li>
            <li>Personalize your experience</li>
            <li>Communicate with you</li>
            <li>Monitor and analyze trends and usage</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of certain data collection</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Contact Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Email: contact@bubblescafe.space
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
}