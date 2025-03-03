import { motion } from "framer-motion";

export default function FeedbackPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-6">Feedback & Suggestions</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-6">
            We value your feedback and are constantly working to improve your experience.
            Share your thoughts, suggestions, or report any issues you've encountered.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Submit Feedback</h2>
          <p>
            Your feedback helps us improve. Please be as specific as possible when describing your
            experience or suggestion.
          </p>
          
          <form className="mt-6 space-y-4">
            <div>
              <label htmlFor="feedback-type" className="block text-sm font-medium mb-1">
                Feedback Type
              </label>
              <select
                id="feedback-type"
                className="w-full p-2 rounded-md border bg-background"
              >
                <option value="suggestion">Suggestion</option>
                <option value="bug">Bug Report</option>
                <option value="content">Content Related</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Your Message
              </label>
              <textarea
                id="message"
                rows={5}
                className="w-full p-2 rounded-md border bg-background"
                placeholder="Share your thoughts..."
              />
            </div>
            
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Submit Feedback
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
