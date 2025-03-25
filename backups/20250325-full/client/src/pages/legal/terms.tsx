
import React from "react";

export default function Terms() {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-1 mb-6">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
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
          <h2 className="text-2xl font-semibold">Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">User Content</h2>
          <p className="text-muted-foreground">
            Users are responsible for the content they submit, post, or display on the platform. All content must comply with our community guidelines and content policies.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Content must be original or properly attributed</li>
            <li>No harmful, illegal, or inappropriate content</li>
            <li>Respect intellectual property rights</li>
            <li>Follow community guidelines</li>
          </ul>
        </section>
        
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Account Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Maintain account security</li>
            <li>Provide accurate information</li>
            <li>Follow community guidelines</li>
            <li>Report violations</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Data Security</h2>
          <p className="text-muted-foreground">
            We implement appropriate security measures to protect your data. However, no online platform is completely secure. 
            We encourage you to use strong passwords and exercise caution when sharing personal information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Modifications to Service</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify or discontinue the service at any time. We will provide notice of any significant changes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Contact Us</h2>
          <p className="text-muted-foreground">
            For questions or concerns about these terms or your data, please contact us through our contact form 
            or email us at <a href="mailto:vanessachiwetalu@gmail.com" className="hover:underline">vanessachiwetalu@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
