import { SiWordpress, SiX, SiInstagram, SiGithub, SiLinkedin, SiFacebook } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

interface SocialButtonsProps {
  links?: {
    wordpress?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
    linkedin?: string;
    facebook?: string;
  };
  className?: string;
}

export function SocialButtons({ links = {}, className = "" }: SocialButtonsProps) {
  const { toast } = useToast();

  const defaultLinks = {
    wordpress: "https://bubbleteameimei.wordpress.com",
    twitter: "https://x.com/Bubbleteameimei",
    instagram: "https://www.instagram.com/bubbleteameimei?igsh=dHRxNzM0YnpwanJw",
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
      {finalLinks.github && (
        <button 
          onClick={() => handleSocialClick(finalLinks.github!, "GitHub")}
          className="text-muted-foreground hover:text-[#333] transition-all duration-200 hover:scale-110"
          aria-label="Visit GitHub Profile"
        >
          <SiGithub className="h-5 w-5" />
        </button>
      )}
      {finalLinks.linkedin && (
        <button 
          onClick={() => handleSocialClick(finalLinks.linkedin!, "LinkedIn")}
          className="text-muted-foreground hover:text-[#0077B5] transition-all duration-200 hover:scale-110"
          aria-label="Visit LinkedIn Profile"
        >
          <SiLinkedin className="h-5 w-5" />
        </button>
      )}
      {finalLinks.facebook && (
        <button 
          onClick={() => handleSocialClick(finalLinks.facebook!, "Facebook")}
          className="text-muted-foreground hover:text-[#1877F2] transition-all duration-200 hover:scale-110"
          aria-label="Visit Facebook Profile"
        >
          <SiFacebook className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}