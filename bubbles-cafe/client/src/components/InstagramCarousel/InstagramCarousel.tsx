import React, { useEffect, useState, useRef, memo } from 'react';
import { Heart, MessageSquare, Send, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import './instagram-carousel.css';

interface Image {
  src: string;
  alt: string;
}

interface InstagramCarouselProps {
  images: Image[];
  profileImage: string;
  profileName: string;
  caption?: string;
}

export const InstagramCarousel: React.FC<InstagramCarouselProps> = memo(({
  images,
  profileImage,
  profileName,
  caption
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const scrollAmount = index * carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < images.length - 1) {
      scrollToIndex(activeIndex + 1);
    } else {
      scrollToIndex(0); // Loop back to the first image
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    } else {
      scrollToIndex(images.length - 1); // Loop to the last image
    }
  };

  // Handle scroll events to update the active index
  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current) {
        const scrollLeft = carouselRef.current.scrollLeft;
        const itemWidth = carouselRef.current.offsetWidth;
        const index = Math.round(scrollLeft / itemWidth);
        if (index !== activeIndex && index >= 0 && index < images.length) {
          setActiveIndex(index);
        }
      }
    };

    const carouselElement = carouselRef.current;
    if (carouselElement) {
      carouselElement.addEventListener('scroll', handleScroll);
      return () => carouselElement.removeEventListener('scroll', handleScroll);
    }
  }, [activeIndex, images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="insta-carousel">
      {/* Header */}
      <div className="insta-header">
        <img
          src={profileImage}
          alt={profileName}
          className="insta-avatar"
        />
        <span className="insta-username">{profileName}</span>
      </div>
      
      {/* Slides */}
      <div className="insta-slides">
        <div className="insta-slides-container" ref={carouselRef}>
          {images.map((image, i) => (
            <div className="insta-slide" key={i}>
              <img 
                src={image.src} 
                alt={image.alt} 
                loading={i === 0 ? "eager" : "lazy"} 
              />
            </div>
          ))}
        </div>
        
        {/* Navigation buttons - only show if more than one image */}
        {images.length > 1 && (
          <>
            <button 
              className="insta-nav insta-nav-prev" 
              onClick={handlePrev}
              aria-label="Previous image"
              type="button"
            >
              <ChevronLeft />
            </button>
            <button 
              className="insta-nav insta-nav-next" 
              onClick={handleNext}
              aria-label="Next image"
              type="button"
            >
              <ChevronRight />
            </button>
            
            {/* Dot indicators */}
            <div className="insta-indicators">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`insta-dot ${i === activeIndex ? 'active' : ''}`}
                  onClick={() => scrollToIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  type="button"
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Actions */}
      <div className="insta-actions">
        <div className="insta-actions-left">
          <Heart className="insta-icon" />
          <MessageSquare className="insta-icon" />
          <Send className="insta-icon" />
        </div>
        <Bookmark className="insta-icon" />
      </div>
      
      {/* Caption (optional) */}
      {caption && (
        <div className="insta-caption">
          <span className="insta-caption-username">{profileName}</span>
          {caption}
        </div>
      )}
    </div>
  );
});

export default InstagramCarousel;