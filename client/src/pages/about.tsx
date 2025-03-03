
import { motion } from "framer-motion";
import { SiWordpress, SiX, SiInstagram } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

export default function About() {
  const { toast } = useToast();

  const handleSocialClick = (url: string, platform: string) => {
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error(`Failed to open ${platform} link:`, error);
      toast({
        title: "Error",
        description: `Unable to open ${platform}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Header Section with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="font-decorative text-4xl md:text-5xl mb-4">About Me</h1>
          <div className="w-24 h-1 bg-primary/60 mx-auto rounded-full"></div>
        </motion.div>

        {/* About Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-lg dark:prose-invert max-w-none"
        >
          <div className="space-y-8">
            <div className="space-y-4 bg-card/10 backdrop-blur-sm p-6 rounded-lg border border-border/30">
              <p className="leading-relaxed">
                Hi hi, My name is Vanessa Chiwetalu, I made this website for my writing.
                Writing stories is one of my big passions. Fluent in English and Chinese.
                I'm a big fan of horror themed stories and existential dread.
              </p>
            </div>

            <div className="space-y-4 bg-card/10 backdrop-blur-sm p-6 rounded-lg border border-border/30">
              <p className="leading-relaxed">
                I don't like making FAQs so if you have anything you need to ask or comment about
                please leave a comment below or drop me an email through the contact page. I will try to reply ASAP.
                If you do not hear back from me within a week, feel free to send another message.
              </p>
            </div>

            <div className="bg-card/10 backdrop-blur-sm p-6 rounded-lg border border-border/30">
              <p className="font-bold text-primary-foreground leading-relaxed">
                ALL STORIES ON THIS SITE ARE ORIGINAL WORKS. ANY FORM OF PLAGIARISM OR UNAUTHORISED
                REPRODUCTION OF MY CONTENT WILL BE TAKEN SERIOUSLY AND MAY RESULT IN LEGAL ACTION.
                RETRANSLATING OF MY WORK INTO ANOTHER LANGUAGE FOR PROFIT IS NOT ALLOWED. IF YOU
                WOULD LIKE TO SHARE OR USE MY WORK, PLEASE CONTACT ME FIRST FOR PERMISSION.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Social Media Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center gap-6 py-4"
        >
          <div 
            onClick={() => handleSocialClick("https://bubbleteameimei.wordpress.com", "WordPress")}
            className="group flex flex-col items-center cursor-pointer transition-all duration-300"
          >
            <div className="p-3 rounded-full bg-card/20 backdrop-blur-sm border border-border/30 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <SiWordpress className="h-6 w-6" />
            </div>
            <span className="mt-2 text-sm">WordPress</span>
          </div>
          
          <div 
            onClick={() => handleSocialClick("https://twitter.com/vantalison", "Twitter")}
            className="group flex flex-col items-center cursor-pointer transition-all duration-300"
          >
            <div className="p-3 rounded-full bg-card/20 backdrop-blur-sm border border-border/30 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <SiX className="h-6 w-6" />
            </div>
            <span className="mt-2 text-sm">Twitter</span>
          </div>
          
          <div 
            onClick={() => handleSocialClick("https://instagram.com/vantalison", "Instagram")}
            className="group flex flex-col items-center cursor-pointer transition-all duration-300"
          >
            <div className="p-3 rounded-full bg-card/20 backdrop-blur-sm border border-border/30 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <SiInstagram className="h-6 w-6" />
            </div>
            <span className="mt-2 text-sm">Instagram</span>
          </div>
        </motion.div>
        
        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute top-1/4 right-8 w-32 h-32 rounded-full bg-primary/20 blur-3xl -z-10"
        />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="absolute bottom-1/4 left-8 w-40 h-40 rounded-full bg-primary/20 blur-3xl -z-10"
        />
      </div>
    </div>
  );
}
