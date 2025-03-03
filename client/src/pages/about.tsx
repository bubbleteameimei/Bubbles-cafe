
import { motion } from "framer-motion";
import { SiWordpress, SiX, SiInstagram } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

export default function About() {
  const { toast } = useToast();

  const socialLinks = {
    instagram: "https://www.instagram.com/bubbleteameimei/",
    twitter: "https://x.com/Bubbleteameimei",
    wordpress: "https://bubbleteameimei.wordpress.com"
  };

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
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {/* Header Section with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="font-decorative text-5xl md:text-6xl">About Me</h1>
        </motion.div>

        {/* Bio Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-lg dark:prose-invert max-w-4xl mx-auto"
        >
          <p className="text-xl leading-relaxed">
            Welcome to my digital haven of horror. I'm a storyteller fascinated by the darker corners of imagination, where fear meets creativity.
            My journey began with a simple love for the macabre and has evolved into this collection of short, spine-chilling tales.
          </p>
          
          <p className="text-xl leading-relaxed">
            Each story I write is a glimpse into the shadows that linger at the edges of everyday life—the fleeting
            thoughts we dismiss, the strange sensations we ignore, and the whispers we pretend not to hear.
          </p>

          <p className="text-xl leading-relaxed">
            When I'm not crafting horror, I enjoy exploring abandoned places, collecting vintage books, and searching for
            inspiration in the ordinary moments that most people overlook. There's something hauntingly beautiful about finding
            terror in the mundane, don't you think?
          </p>
        </motion.div>

        {/* Philosophy Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card/30 backdrop-blur-sm p-8 rounded-lg border border-border/30 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-semibold mb-4">My Philosophy</h2>
          <p className="text-lg mb-4">
            I believe fear is our most primal emotion—the one that kept our ancestors alive in a world full of dangers.
            By exploring it through fiction, we can safely confront our deepest anxieties and perhaps understand ourselves better.
          </p>
          <p className="text-lg">
            My stories aren't just meant to frighten—they're invitations to question reality, to wonder about the 
            fragile boundaries we create between the known and unknown, and to consider that sometimes, 
            the most terrifying monsters are the ones that live within us.
          </p>
        </motion.div>

        {/* Social Media Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center gap-8 py-8"
        >
          <div 
            onClick={() => handleSocialClick(socialLinks.wordpress, "WordPress")}
            className="group flex flex-col items-center cursor-pointer transition-all duration-300"
          >
            <div className="p-4 rounded-full bg-card/30 backdrop-blur-sm border border-border/30 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <SiWordpress className="h-8 w-8" />
            </div>
            <span className="mt-3 text-base">WordPress</span>
          </div>
          
          <div 
            onClick={() => handleSocialClick(socialLinks.twitter, "Twitter")}
            className="group flex flex-col items-center cursor-pointer transition-all duration-300"
          >
            <div className="p-4 rounded-full bg-card/30 backdrop-blur-sm border border-border/30 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <SiX className="h-8 w-8" />
            </div>
            <span className="mt-3 text-base">Twitter</span>
          </div>
          
          <div 
            onClick={() => handleSocialClick(socialLinks.instagram, "Instagram")}
            className="group flex flex-col items-center cursor-pointer transition-all duration-300"
          >
            <div className="p-4 rounded-full bg-card/30 backdrop-blur-sm border border-border/30 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <SiInstagram className="h-8 w-8" />
            </div>
            <span className="mt-3 text-base">Instagram</span>
          </div>
        </motion.div>

        {/* Invitation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <p className="text-xl italic">
            "I invite you to turn off the lights, get comfortable, and let my words take you to places you might not venture alone.
            After all, we're all just one strange encounter away from our own horror story..."
          </p>
        </motion.div>
      </div>
    </div>
  );
}
