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
    <div className={`social-buttons ${className} flex justify-center items-center gap-4 p-4 bg-background/80 backdrop-blur-sm rounded-full shadow-lg border border-border/50`}>
      {links.wordpress && (
        <a href={links.wordpress} target="_blank" rel="noopener noreferrer" 
          className="social-button wordpress transform hover:scale-110 transition-all">
          <SiWordpress className="h-5 w-5" />
        </a>
      )}
      {links.twitter && (
        <a href={links.twitter} target="_blank" rel="noopener noreferrer" 
          className="social-button twitter transform hover:scale-110 transition-all">
          <SiX className="h-5 w-5" />
        </a>
      )}
      {links.instagram && (
        <a href={links.instagram} target="_blank" rel="noopener noreferrer" 
          className="social-button instagram transform hover:scale-110 transition-all">
          <SiInstagram className="h-5 w-5" />
        </a>
      )}
      {links.github && (
        <a href={links.github} target="_blank" rel="noopener noreferrer" 
          className="social-button github transform hover:scale-110 transition-all">
          <SiGithub className="h-5 w-5" />
        </a>
      )}
      {links.linkedin && (
        <a href={links.linkedin} target="_blank" rel="noopener noreferrer" 
          className="social-button linkedin transform hover:scale-110 transition-all">
          <SiLinkedin className="h-5 w-5" />
        </a>
      )}
      {links.facebook && (
        <a href={links.facebook} target="_blank" rel="noopener noreferrer" 
          className="social-button facebook transform hover:scale-110 transition-all">
          <SiFacebook className="h-5 w-5" />
        </a>
      )}
    </div>
  );
}