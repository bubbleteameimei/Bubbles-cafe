import React from "react";
import Footer from "@/components/layout/footer";

export default function Privacy() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none text-base leading-7">
        <section>
          <h2>Content Protection Notice</h2>
          <p className="whitespace-pre-line">
            ALL CONTENT ON THIS SITE IS ORIGINAL AND PROTECTED. UNAUTHORIZED REPRODUCTION, PLAGIARISM, OR COMMERCIAL TRANSLATION OF MY WORK IS STRICTLY PROHIBITED AND MAY RESULT IN LEGAL ACTION. IF YOU WISH TO SHARE OR USE ANY CONTENT, PLEASE OBTAIN PRIOR PERMISSION BY CONTACTING ME DIRECTLY.

            THANK YOU FOR YOUR SUPPORT, AND ENJOY THE STORIES.
          </p>
        </section>

        <section>
          <h2>Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li>Account information (email, username)</li>
            <li>Profile information (optional)</li>
            <li>Content you submit (comments, stories)</li>
            <li>Usage data (how you interact with our site)</li>
            <li>Device information (browser type, IP address)</li>
          </ul>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and improve our services</li>
            <li>Personalize your experience</li>
            <li>Communicate with you</li>
            <li>Monitor and analyze trends and usage</li>
          </ul>
        </section>

        <section>
          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of certain data collection</li>
          </ul>
        </section>

        <section>
          <h2>Contact Information</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            Email: contact@bubblescafe.space
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
}