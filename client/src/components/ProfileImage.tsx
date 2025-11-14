import OptimizedImage from '@/components/ui/OptimizedImage';

export default function ProfileImage() {
  const src = '/images/author-profile.jpg';
  const bust = String(Date.now());

  return (
    <div className="relative flex justify-center mt-4" style={{ width: '100%' }}>
      {/* Subtle shadow for depth */}
      <div className="absolute rounded-full w-[210px] h-[210px] opacity-15 blur-md bg-black transform -translate-x-1 translate-y-2" />

      <div className="relative" style={{ width: '200px', height: '200px' }}>
        {/* Gentle glow behind the image */}
        <div
          className="absolute inset-0 rounded-full bg-[#8B0000]/20 dark:bg-[#8B0000]/30 blur-xl transform scale-[1.15]"
          style={{ animation: 'pulse-slow 4s ease-in-out infinite' }}
        />
        <div className="h-48 w-48 relative border-2 border-[#8B0000]/30 dark:border-[#8B0000]/40 shadow-lg ring-1 ring-[#660000]/20 dark:ring-[#660000]/30 ring-offset-1 ring-offset-background rounded-full overflow-hidden p-1 bg-background/70 mx-auto">
          <OptimizedImage
            src={`${src}?v=${bust}`}
            srcSet={`${src}?v=${bust} 900w`}
            alt="Author Profile"
            width={200}
            height={200}
            priority={true}
            loadingStrategy="eager"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>
    </div>
  );
}