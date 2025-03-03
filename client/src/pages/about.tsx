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

        <div className="bg-card rounded-lg shadow-lg p-6 space-y-6">
          <div className="prose dark:prose-invert max-w-none">
            <p>
              Welcome to my little corner of the web, where nightmares come alive through words. I'm a writer with a passion for the macabre, the disturbing, and the things that go bump in the night.
            </p>

            <p>
              Ever since I was young, I've been fascinated by horror stories. There's something about the thrill of fear, the racing heart, and the rush of adrenaline that comes from experiencing horror in a controlled environment that I find irresistible.
            </p>

            <p>
              My writing explores the darkest corners of the human mind, delving into fears both common and uncommon. I believe that horror is a deeply personal experience, and what terrifies one person might not affect another at all. That's why I try to create a diverse range of horror stories, hoping that at least one of them will find that tender spot in your psyche that makes you leave the light on at night.
            </p>

            <p>
              When I'm not writing, I'm reading works by masters of horror like Stephen King, Shirley Jackson, and Junji Ito, watching horror movies that others find too disturbing, or exploring abandoned places that whisper stories of their own.
            </p>

            <p>
              This website is my digital collection of short horror stories, designed to be consumed in one sitting. Perfect for those moments when you want a quick scare during your lunch break, before bed (if you dare), or while waiting for someone who's running late.
            </p>

            <p>
              I hope you enjoy your time here. Feel free to leave comments, share your thoughts, or reach out to me directly. And remember, that creeping sensation on the back of your neck while reading my stories? It might not just be your imagination...
            </p>

            <p className="italic text-center mt-8">
              "No great mind has ever existed without a touch of madness."<br/>
              - Aristotle
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