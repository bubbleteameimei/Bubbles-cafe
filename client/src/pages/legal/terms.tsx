
import React from "react";

export default function Terms() {
  return (
    <>
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
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
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2>User Content</h2>
            <p>
              Users are responsible for the content they submit, post, or display on the platform. All content must comply with our community guidelines and content policies.
            </p>
            <ul>
              <li>Content must be original or properly attributed</li>
              <li>No harmful, illegal, or inappropriate content</li>
              <li>Respect intellectual property rights</li>
              <li>Follow community guidelines</li>
              <li>Report violations</li>
            </ul>
          </section>
            
          <section>
            <h2>Account Responsibilities</h2>
            <ul>
              <li>Maintain account security</li>
              <li>Provide accurate information</li>
              <li>Follow community guidelines</li>
              <li>Report violations</li>
            </ul>
          </section>

          <section>
            <h2>Data Security</h2>
            <p>
              We implement appropriate security measures to protect your data. 
              We encourage you to use strong passwords and exercise caution when sharing personal information.
            </p>
          </section>

          <section>
            <h2>Modifications to Service</h2>
            <p>
              We reserve the right to modify or discontinue the service at any time. We will provide notice of any significant changes.
            </p>
          </section>

          <section>
            <h2>Contact Us</h2>
            <p>
              For questions or concerns about these terms or your data, please contact us through our contact form 
              or email us at <a href="mailto:contact@bubblescafe.space" className="hover:underline">contact@bubblescafe.space</a>.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
