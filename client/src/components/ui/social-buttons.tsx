import { SiWordpress, SiX, SiInstagram, SiGithub, SiLinkedin, SiFacebook } from "react-icons/si";

interface SocialButtonsProps {
  links: {
    wordpress?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
    linkedin?: string;
    facebook?: string;
  };
  className?: string;
}

export function SocialButtons({ links, className = "" }: SocialButtonsProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {links.wordpress && (
        <a href={links.wordpress} target="_blank" rel="noopener noreferrer" 
          className="text-muted-foreground hover:text-[#21759b] transition-all duration-200 hover:scale-110">
          <SiWordpress className="h-5 w-5" />
        </a>
      )}
      {links.twitter && (
        <a href={links.twitter} target="_blank" rel="noopener noreferrer" 
          className="text-muted-foreground hover:text-[#1DA1F2] transition-all duration-200 hover:scale-110">
          <SiX className="h-5 w-5" />
        </a>
      )}
      {links.instagram && (
        <a href={links.instagram} target="_blank" rel="noopener noreferrer" 
          className="text-muted-foreground hover:text-[#E4405F] transition-all duration-200 hover:scale-110">
          <SiInstagram className="h-5 w-5" />
        </a>
      )}
      {links.github && (
        <a href={links.github} target="_blank" rel="noopener noreferrer" 
          className="text-muted-foreground hover:text-[#333] transition-all duration-200 hover:scale-110">
          <SiGithub className="h-5 w-5" />
        </a>
      )}
      {links.linkedin && (
        <a href={links.linkedin} target="_blank" rel="noopener noreferrer" 
          className="text-muted-foreground hover:text-[#0077B5] transition-all duration-200 hover:scale-110">
          <SiLinkedin className="h-5 w-5" />
        </a>
      )}
      {links.facebook && (
        <a href={links.facebook} target="_blank" rel="noopener noreferrer" 
          className="text-muted-foreground hover:text-[#1877F2] transition-all duration-200 hover:scale-110">
          <SiFacebook className="h-5 w-5" />
        </a>
      )}
    </div>
  );
}