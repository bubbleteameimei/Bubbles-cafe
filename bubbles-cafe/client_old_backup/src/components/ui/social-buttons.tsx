import { SiWordpress, SiX, SiInstagram } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

interface SocialButtonsProps {
  links?: {
    wordpress?: string;
    twitter?: string;
    instagram?: string;
  };
  className?: string;
}

export function SocialButtons({ links = {}, className = "" }: SocialButtonsProps) {
  const { toast } = useToast();

  const defaultLinks = {
    wordpress: "https://bubbleteameimei.wordpress.com",
    twitter: "https://x.com/Bubbleteameimei",
    instagram: "https://www.instagram.com/bubbleteameimei/"
  };

  const finalLinks = { ...defaultLinks, ...links };

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
    <div className={`flex items-center gap-4 ${className}`}>
      {finalLinks.wordpress && (
        <button 
          onClick={() => handleSocialClick(finalLinks.wordpress!, "WordPress")}
          className="text-muted-foreground hover:text-[#21759b] transition-all duration-200 hover:scale-110"
          aria-label="Visit WordPress Blog"
        >
          <SiWordpress className="h-5 w-5" />
        </button>
      )}
      {finalLinks.twitter && (
        <button 
          onClick={() => handleSocialClick(finalLinks.twitter!, "Twitter")}
          className="text-muted-foreground hover:text-[#1DA1F2] transition-all duration-200 hover:scale-110"
          aria-label="Visit Twitter/X Profile"
        >
          <SiX className="h-5 w-5" />
        </button>
      )}
      {finalLinks.instagram && (
        <button 
          onClick={() => handleSocialClick(finalLinks.instagram!, "Instagram")}
          className="text-muted-foreground hover:text-[#E4405F] transition-all duration-200 hover:scale-110"
          aria-label="Visit Instagram Profile"
        >
          <SiInstagram className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}