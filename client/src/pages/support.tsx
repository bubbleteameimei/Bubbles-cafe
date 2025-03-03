import { motion } from "framer-motion";

export default function SupportPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-6">Support Center</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-6">
            Need help? Our support team is here to assist you with any questions or concerns you may have.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Support</h2>
          <p>
            For immediate assistance, you can reach our support team through the following channels:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Email: support@horrorstories.com</li>
            <li>Response Time: Within 24-48 hours</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-2">How do I reset my password?</h3>
              <p>You can reset your password by clicking the "Forgot Password" link on the login page.</p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">How do I report a story?</h3>
              <p>Use the report button located on each story page to submit your concerns to our moderation team.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
