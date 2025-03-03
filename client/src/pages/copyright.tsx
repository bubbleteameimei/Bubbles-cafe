import { motion } from "framer-motion";

export default function CopyrightPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-6">Copyright Policy</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-6">
            We respect the intellectual property rights of others and expect our users to do the same.
            This policy outlines how we handle copyright-related matters on Horror Stories.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Copyright Protection</h2>
          <p>
            All content posted on Horror Stories is protected by copyright law. Users may only
            post content they own or have permission to use.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">DMCA Compliance</h2>
          <p>
            We follow the Digital Millennium Copyright Act (DMCA) guidelines for handling
            copyright infringement claims. If you believe your work has been copied in a way
            that constitutes copyright infringement, please contact our copyright agent.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Reporting Copyright Violations</h2>
          <p>
            To report a copyright violation, please provide the following information:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>A description of the copyrighted work</li>
            <li>The location of the infringing material on our site</li>
            <li>Your contact information</li>
            <li>A statement of good faith belief in the infringement</li>
            <li>A statement of accuracy under penalty of perjury</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
