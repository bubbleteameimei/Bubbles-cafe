import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="backdrop-blur-sm bg-card/90">
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
              <p className="font-bold">
                ALL STORIES ON THIS SITE ARE ORIGINAL WORKS. ANY FORM OF PLAGIARISM OR UNAUTHORISED 
                REPRODUCTION OF MY CONTENT WILL BE TAKEN SERIOUSLY AND MAY RESULT IN LEGAL ACTION. 
                RETRANSLATING OF MY WORK INTO ANOTHER LANGUAGE FOR PROFIT IS NOT ALLOWED. IF YOU 
                WOULD LIKE TO SHARE OR USE MY WORK, PLEASE CONTACT ME FIRST FOR PERMISSION.
              </p>

              <div className="mt-8 pt-4 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">Follow Me</h3>
                <div className="flex gap-6">
                  <button
                    onClick={() => handleSocialClick("https://bubbleteameimei.wordpress.com", "WordPress")}
                    className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 flex items-center gap-2"
                    aria-label="Visit WordPress Blog"
                  >
                    <SiWordpress className="h-6 w-6" />
                    <span>WordPress</span>
                  </button>
                  <button
                    onClick={() => handleSocialClick("https://twitter.com/Bubbleteameimei", "Twitter")}
                    className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 flex items-center gap-2"
                    aria-label="Visit Twitter/X Profile"
                  >
                    <SiX className="h-6 w-6" />
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() => handleSocialClick("https://www.instagram.com/bubbleteameimei", "Instagram")}
                    className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 flex items-center gap-2"
                    aria-label="Visit Instagram Profile"
                  >
                    <SiInstagram className="h-6 w-6" />
                    <span>Instagram</span>
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}