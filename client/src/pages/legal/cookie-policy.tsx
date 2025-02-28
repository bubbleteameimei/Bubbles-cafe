import { motion } from "framer-motion";

export default function CookiePolicy() {
  return (
    <motion.div 
      className="container max-w-4xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">What Are Cookies</h2>
          <p>Cookies are small text files that are stored on your computer or mobile device when you visit our website. They help us provide you with a better experience by:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Remembering your preferences</li>
            <li>Keeping you signed in</li>
            <li>Understanding how you use our site</li>
            <li>Improving our services</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Essential cookies (required for basic functionality)</li>
            <li>Preference cookies (remember your settings)</li>
            <li>Analytics cookies (help us improve)</li>
            <li>Authentication cookies (keep you signed in)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Cookie Choices</h2>
          <p>You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.</p>
        </section>
      </div>
    </motion.div>
  );
}
