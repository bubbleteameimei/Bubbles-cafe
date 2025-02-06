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
    <div className={`social-buttons ${className}`}>
      {links.wordpress && (
        <a href={links.wordpress} target="_blank" rel="noopener noreferrer" className="social-button wordpress">
          <SiWordpress className="h-5 w-5" />
        </a>
      )}
      {links.twitter && (
        <a href={links.twitter} target="_blank" rel="noopener noreferrer" className="social-button twitter">
          <SiX className="h-5 w-5" />
        </a>
      )}
      {links.instagram && (
        <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="social-button instagram">
          <SiInstagram className="h-5 w-5" />
        </a>
      )}
      {links.github && (
        <a href={links.github} target="_blank" rel="noopener noreferrer" className="social-button github">
          <SiGithub className="h-5 w-5" />
        </a>
      )}
      {links.linkedin && (
        <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="social-button linkedin">
          <SiLinkedin className="h-5 w-5" />
        </a>
      )}
      {links.facebook && (
        <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="social-button facebook">
          <SiFacebook className="h-5 w-5" />
        </a>
      )}
    </div>
  );
}