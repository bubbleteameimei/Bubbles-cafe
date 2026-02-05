import React from 'react';
import { Button } from '@/components/ui/button';
import { FaTwitter, FaWordpress, FaInstagram } from 'react-icons/fa';

const ReaderSocialIcons: React.FC = () => {
  return (
    <>
      {/* Twitter */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          window.open('https://twitter.com/Bubbleteameimei', '_blank', 'noopener,noreferrer');
        }}
        className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
      >
        <FaTwitter className="h-4 w-4" />
        <span className="sr-only">Follow on Twitter</span>
      </Button>

      {/* WordPress */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          window.open('https://bubbleteameimei.wordpress.com/', '_blank', 'noopener,noreferrer');
        }}
        className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
      >
        <FaWordpress className="h-4 w-4" />
        <span className="sr-only">Follow on WordPress</span>
      </Button>

      {/* Instagram */}
      <Button
        asChild
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
      >
        <a href="https://www.instagram.com/Bubbleteameimei/" target="__blank" rel="noreferrer">
          <FaInstagram className="h-4 w-4" />
          <span className="sr-only">Follow on Instagram</span>
        </a>
      </Button>
    </>
  );
};

export default ReaderSocialIcons;
