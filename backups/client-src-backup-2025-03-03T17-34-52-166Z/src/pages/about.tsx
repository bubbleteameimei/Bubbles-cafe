import React from "react";
import { motion } from "framer-motion";
import { SocialButtons } from "@/components/ui/social-buttons";

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-4xl mx-auto px-4 py-8"
    >
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">About Me</h1>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          <p>
            Hi hi, My name is Vanessa. This website is my digital collection of short horror stories, designed to be consumed in one sitting. Fluent in English and Chinese.
          </p>

          <p>
            My writing explores the darkest corners of the human mind, delving into fears both common and uncommon. I believe that horror is a deeply personal experience, and what terrifies one person might not affect another at all. That's why I try to create a diverse range of horror stories, hoping that at least one of them will find that tender spot in your psyche that makes you leave the light on at night.
          </p>

          <p>
            I hope you enjoy your time here. Feel free to leave comments, share your thoughts, or reach out to me directly.
          </p>

          <p>
            If you have anything you need to ask or comment about please leave a comment or drop me an email through the contact page. I will try to reply ASAP. If you do not hear back from me within a week, please feel free to send another message.
          </p>

          <p>
            And remember, that creeping sensation on the back of your neck while reading my stories? It might not just be your imagination...
          </p>

          <p className="italic text-center mt-8">
            "No great mind has ever existed without a touch of madness."<br/>
            - Aristotle
          </p>

          <div className="border-t border-t-primary/30 pt-6 mt-6">
            <p className="font-bold text-center text-sm">
              DISCLAIMER
            </p>
            <p className="text-sm">
              ALL STORIES ON THIS SITE ARE ORIGINAL WORKS. ANY FORM OF PLAGIARISM OR UNAUTHORISED REPRODUCTION OF MY CONTENT WILL BE TAKEN SERIOUSLY AND MAY RESULT IN LEGAL ACTION. RETRANSLATING OF MY WORK INTO ANOTHER LANGUAGE FOR PROFIT IS NOT ALLOWED. IF YOU WOULD LIKE TO SHARE OR USE MY WORK, PLEASE CONTACT ME FIRST FOR PERMISSION.
            </p>
          </div>

          <div className="mt-6 flex justify-center">
            <SocialButtons
              links={{
                wordpress: "https://bubbleteameimei.wordpress.com",
                twitter: "https://x.com/Bubbleteameimei",
                instagram: "https://www.instagram.com/bubbleteameimei?igsh=dHRxNzM0YnpwanJw"
              }}
              className="text-2xl"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}