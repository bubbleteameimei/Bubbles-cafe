import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaGithub, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Separator } from '@/components/ui/separator';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-center mb-6">About Me</h1>

        <div className="space-y-8">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg">
              Hi hi, My name is Vanessa Chiwetalu, I made this website for my writing.
              Writing stories is one of my big passions. Fluent in English and Chinese.
              I'm a big fan of horror themed stories and existential dread.
            </p>

            <blockquote className="border-l-4 border-primary pl-4 italic my-6">
              "No great mind has ever existed without a touch of madness."
              <footer className="text-sm mt-2">- Aristotle</footer>
            </blockquote>

            <p>
              I don't like making FAQs so if you have anything you need to ask or comment about
              please leave a comment below or drop me an email through the contact page. I will try to reply ASAP.
              If you do not hear back from me within a week, feel free to send another message.
            </p>

            <p className="font-bold mt-6">
              ALL STORIES ON THIS SITE ARE ORIGINAL WORKS. ANY FORM OF PLAGIARISM OR UNAUTHORISED
              REPRODUCTION OF MY CONTENT WILL BE TAKEN SERIOUSLY AND MAY RESULT IN LEGAL ACTION.
              RETRANSLATING OF MY WORK INTO ANOTHER LANGUAGE FOR PROFIT IS NOT ALLOWED. IF YOU
              WOULD LIKE TO SHARE OR USE MY WORK, PLEASE CONTACT ME FIRST FOR PERMISSION.
            </p>
          </div>

          <Separator className="my-6" />

          <div>
            <h2 className="text-xl font-semibold mb-4">Connect With Me</h2>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com/vanessacodes" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <FaTwitter size={24} />
                <span className="sr-only">Twitter</span>
              </a>
              <a 
                href="https://instagram.com/horror_writer_v" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <FaInstagram size={24} />
                <span className="sr-only">Instagram</span>
              </a>
              <a 
                href="https://github.com/vantalison" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <FaGithub size={24} />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}