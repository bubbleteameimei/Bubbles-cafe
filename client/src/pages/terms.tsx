import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-6">
            By accessing and using Horror Stories, you agree to be bound by these Terms of Service.
            Please read them carefully before using our services.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Horror Stories, you agree to be bound by these Terms of Service
            and all applicable laws and regulations. If you do not agree with any of these terms,
            you are prohibited from using or accessing this site.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Content Guidelines</h2>
          <p>
            All content must adhere to our community guidelines. We reserve the right to remove
            any content that violates these guidelines or that we deem inappropriate.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password.
            You agree to accept responsibility for all activities that occur under your account.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Content Ownership</h2>
          <p>
            Users retain all ownership rights to their original content. By posting content,
            you grant Horror Stories a non-exclusive license to use, modify, and display that content.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
