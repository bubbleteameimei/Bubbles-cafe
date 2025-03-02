import { memo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SiInstagram, SiTwitter, SiWordpress } from 'react-icons/si';

export const SocialIcons = memo(() => {
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
    <div className="flex items-center gap-4 p-4">
      <button 
        onClick={() => handleSocialClick(socialLinks.instagram, "Instagram")}
        className="p-2 rounded-full hover:bg-accent transition-colors"
        aria-label="Visit Instagram Profile"
      >
        <SiInstagram className="w-6 h-6 text-muted-foreground hover:text-primary" />
      </button>

      <button 
        onClick={() => handleSocialClick(socialLinks.twitter, "Twitter")}
        className="p-2 rounded-full hover:bg-accent transition-colors"
        aria-label="Visit Twitter/X Profile"
      >
        <SiTwitter className="w-6 h-6 text-muted-foreground hover:text-primary" />
      </button>

      <button 
        onClick={() => handleSocialClick(socialLinks.wordpress, "WordPress")}
        className="p-2 rounded-full hover:bg-accent transition-colors"
        aria-label="Visit WordPress Blog"
      >
        <SiWordpress className="w-6 h-6 text-muted-foreground hover:text-primary" />
      </button>
    </div>
  );
});

SocialIcons.displayName = "SocialIcons";