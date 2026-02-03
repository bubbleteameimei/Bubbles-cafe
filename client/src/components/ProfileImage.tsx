export default function ProfileImage() {
  const src = '/images/author-profile.jpg';

  return (
    <div className="relative flex justify-center mt-4" style={{ width: '100%' }}>
      {/* Subtle shadow for depth */}
      <div className="pointer-events-none absolute rounded-full w-[210px] h-[210px] opacity-15 blur-md bg-black translate-y-2" />

      <div className="relative" style={{ width: '200px', height: '200px' }}>
        {/* Gentle glow behind the image */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full bg-[#8B0000]/20 dark:bg-[#8B0000]/30 blur-xl transform scale-[1.08]"
          style={{ animation: 'pulse-slow 4s ease-in-out infinite' }}
        />
        <div className="relative h-48 w-48 mx-auto rounded-full overflow-hidden border-2 border-[#8B0000]/30 dark:border-[#8B0000]/40 shadow-lg ring-1 ring-[#660000]/20 dark:ring-[#660000]/30 ring-offset-1 ring-offset-background bg-background/70">
          <img
            src={src}
            alt="Author Profile"
            loading="lazy"
            decoding="async"
            fetchPriority="high"
            className="w-[140%] h-[140%] object-cover rounded-full -translate-x-[20%] -translate-y-[10%]"
          />
        </div>
      </div>
    </div>
  );
}