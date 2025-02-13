import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-8 backdrop-blur-sm bg-card/90">
          <CardHeader>
            <CardTitle>About Me</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-foreground">
              <p>
                Hi hi, My name is Vanessa Chiwetalu, I made this website for my writing. 
                Writing stories is one of my big passions. Fluent in English and Chinese. 
                I'm a big fan of horror themed stories and existential dread.
              </p>
              <p>
                I don't like making FAQs so if you have anything you need to ask or comment about 
                please leave a comment below or drop me an email through the contact page. I will try to reply ASAP. 
                If you do not hear back from me within a week, feel free to send another message.
              </p>
              <p>
                IMPORTANT: All stories on this site are original works. Any form of plagiarism or 
                unauthorized reproduction of my content will be taken seriously and may result in legal action. 
                If you would like to share or use my work, please contact me first for permission.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}