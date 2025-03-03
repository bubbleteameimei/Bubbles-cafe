
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Feedback() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your server
    console.log("Feedback submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
    // Reset form after 3 seconds
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <motion.div 
      className="container max-w-4xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold mb-8">Feedback & Suggestions</h1>
      
      <div className="prose dark:prose-invert max-w-none mb-8">
        <p>We value your feedback and suggestions to improve our platform. Please let us know your thoughts, ideas, or report any issues you've encountered.</p>
      </div>

      {submitted ? (
        <div className="bg-green-800/20 border border-green-500/50 rounded-md p-4 mb-8">
          <p className="text-green-400 font-medium">Thank you for your feedback! We'll review it shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">Your Name</label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">Your Email</label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="message" className="block text-sm font-medium">Your Message</label>
            <Textarea 
              id="message" 
              name="message" 
              rows={6} 
              value={formData.message}
              onChange={handleChange}
              required 
              className="resize-none" 
            />
          </div>
          
          <Button type="submit" className="w-full sm:w-auto">
            Submit Feedback
          </Button>
        </form>
      )}
    </motion.div>
  );
}
