
import React from "react";
import { motion } from "framer-motion";

export default function Terms() {
  return (
    <motion.div
      className="container max-w-4xl mx-auto py-12 px-6 min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-black/40 backdrop-blur-md p-8 md:p-10 rounded-xl border border-white/10 shadow-xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-10 text-white text-center pb-4 border-b border-white/10">Terms of Service</h1>
        
        <div className="space-y-10 prose prose-invert max-w-none">
          <section className="space-y-5">
            <h2 className="text-2xl font-semibold text-white/90">Content Protection Notice</h2>
            <p className="text-white/80 whitespace-pre-line leading-relaxed tracking-wide">
              ALL CONTENT ON THIS SITE IS ORIGINAL AND PROTECTED. UNAUTHORIZED REPRODUCTION, PLAGIARISM, OR COMMERCIAL TRANSLATION OF MY WORK IS STRICTLY PROHIBITED AND MAY RESULT IN LEGAL ACTION. IF YOU WISH TO SHARE OR USE ANY CONTENT, PLEASE OBTAIN PRIOR PERMISSION BY CONTACTING ME DIRECTLY.

              THANK YOU FOR YOUR SUPPORT, AND ENJOY THE STORIES.
            </p>
          </section>

          <section className="space-y-5">
            <h2 className="text-2xl font-semibold text-white/90">Acceptance of Terms</h2>
            <p className="text-white/80 leading-relaxed tracking-wide">
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="space-y-5">
            <h2 className="text-2xl font-semibold text-white/90">User Content</h2>
            <p className="text-white/80 leading-relaxed tracking-wide">
              Users are responsible for the content they submit, post, or display on the platform. All content must comply with our community guidelines and content policies.
            </p>
            <ul className="list-disc pl-8 space-y-3 text-white/80">
              <li className="pl-2">Content must be original or properly attributed</li>
              <li className="pl-2">No harmful, illegal, or inappropriate content</li>
              <li className="pl-2">Respect intellectual property rights</li>
              <li className="pl-2">Follow community guidelines</li>
            </ul>
          </section>
          
          <section className="space-y-5">
            <h2 className="text-2xl font-semibold text-white/90">Account Responsibilities</h2>
            <ul className="list-disc pl-8 space-y-3 text-white/80">
              <li className="pl-2">Maintain account security</li>
              <li className="pl-2">Provide accurate information</li>
              <li className="pl-2">Follow community guidelines</li>
              <li className="pl-2">Report violations</li>
            </ul>
          </section>

          <section className="space-y-5">
            <h2 className="text-2xl font-semibold text-white/90">Data Security</h2>
            <p className="text-white/80 leading-relaxed tracking-wide">
              We implement appropriate security measures to protect your data. However, no online platform is completely secure. 
              We encourage you to use strong passwords and exercise caution when sharing personal information.
            </p>
          </section>

          <section className="space-y-5">
            <h2 className="text-2xl font-semibold text-white/90">Modifications to Service</h2>
            <p className="text-white/80 leading-relaxed tracking-wide">
              We reserve the right to modify or discontinue the service at any time. We will provide notice of any significant changes.
            </p>
          </section>

          <section className="space-y-5">
            <h2 className="text-2xl font-semibold text-white/90">Contact Us</h2>
            <p className="text-white/80 leading-relaxed tracking-wide">
              For questions or concerns about these terms or your data, please contact us through our contact form 
              or email us at <a href="mailto:vanessachiwetalu@gmail.com" className="text-white hover:underline">vanessachiwetalu@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
