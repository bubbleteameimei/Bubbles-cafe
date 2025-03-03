
import { useEffect } from "react";
import { Layout } from "@/components/layout";
import { Metadata } from "@/components/ui/metadata";
import { PageTransition } from "@/components/animations/page-transition";
import { useToast } from "@/hooks/use-toast";
import { SiInstagram, SiWordpress } from "react-icons/si";
import { SiX } from "react-icons/si";

export const metadata: Metadata = {
  title: "About | Horror Tales",
  description: "Learn more about the author and the inspiration behind Horror Tales."
};

export default function AboutPage() {
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <Layout>
      <PageTransition>
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">About Me</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
            <div className="space-y-6">
              <p className="text-lg">
                My name is Mei, I'm an aspiring horror writer with a passion for all things macabre. 
                I've been writing short horror stories since childhood, drawing inspiration from the darkest 
                corners of the human psyche.
              </p>
              
              <p className="text-lg">
                I started this website as a place to share my stories and connect with others who 
                appreciate the horror genre. Each story is crafted to evoke a sense of unease and 
                discomfort, exploring themes of fear, isolation, and the unknown.
              </p>
              
              <p className="text-lg">
                My influences include classic horror authors like Edgar Allan Poe and H.P. Lovecraft, 
                as well as modern writers such as Junji Ito and Stephen King. I'm also inspired by 
                psychological thrillers, urban legends, and the occasional true crime story.
              </p>
              
              <p className="text-lg">
                When I'm not writing, I can be found exploring abandoned places, researching obscure 
                folklore, or curled up with a good horror novel. I also enjoy photography, particularly 
                capturing eerie landscapes and forgotten spaces.
              </p>
              
              <p className="text-lg">
                I'm constantly working on new stories and experimenting with different styles of horror. 
                Some tales are subtle and psychological, while others are more visceral and explicit. 
                My goal is to create a diverse collection that can unsettle even the most seasoned 
                horror enthusiasts.
              </p>
              
              <p className="text-lg italic text-center mt-10 mb-8">
                "No great mind has ever existed without a touch of madness."
                <br />
                - Aristotle
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
                    onClick={() => handleSocialClick("https://x.com/Bubbleteameimei", "Twitter")}
                    className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 flex items-center gap-2"
                    aria-label="Visit Twitter/X Profile"
                  >
                    <SiX className="h-6 w-6" />
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() => handleSocialClick("https://www.instagram.com/bubbleteameimei/", "Instagram")}
                    className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 flex items-center gap-2"
                    aria-label="Visit Instagram Profile"
                  >
                    <SiInstagram className="h-6 w-6" />
                    <span>Instagram</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
}
