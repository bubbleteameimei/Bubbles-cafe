import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "../styles/privacy-policy.css";

export default function Privacy() {
  return (
    <div className="privacy-policy">
      <h1>Privacy Policy</h1>
      <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>

      <section>
        <h2>Content Protection Notice</h2>
        <p>
          ALL CONTENT ON THIS SITE IS ORIGINAL AND PROTECTED. UNAUTHORIZED REPRODUCTION, PLAGIARISM, OR COMMERCIAL TRANSLATION OF MY WORK IS STRICTLY PROHIBITED AND MAY RESULT IN LEGAL ACTION. IF YOU WISH TO SHARE OR USE ANY CONTENT, PLEASE OBTAIN PRIOR PERMISSION BY CONTACTING ME DIRECTLY.
        </p>
        <p>
          THANK YOU FOR YOUR SUPPORT, AND ENJOY THE STORIES.
        </p>
      </section>

      <section>
        <h2>Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <ul>
          <li>Personal information (name, email address)</li>
          <li>Login credentials</li>
          <li>Usage data and preferences</li>
          <li>Device information</li>
          <li>Cookies and similar technologies</li>
        </ul>
      </section>

      <section>
        <h2>How We Use Your Information</h2>
        <p>We use the collected information for various purposes, including:</p>
        <ul>
          <li>Providing and improving our services</li>
          <li>Personalizing your experience</li>
          <li>Processing transactions</li>
          <li>Communicating with you</li>
          <li>Analyzing usage patterns</li>
        </ul>
      </section>

      <section>
        <h2>Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
        </p>
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
        <p className="contact-info">
          If you have any questions about this Privacy Policy, please contact us at:
          <br />
          Email: vanessachiwetalu@gmail.com
        </p>
      </section>
    </div>
  );
}