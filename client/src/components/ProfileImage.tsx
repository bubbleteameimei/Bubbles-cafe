/**
 * Author portrait for the About page.
 *
 * Uses a square crop centred on the round portrait (author-profile-square.webp), so the
 * image simply fills the circle. The previous version zoomed the original 896x1152 photo
 * to 140% and nudged it left/up by hand, which left the face visibly off-centre.
 */
export default function ProfileImage() {
  return (
    <div className="relative mx-auto mt-4 h-48 w-48">
      {/* Soft shadow and glow, centred on the same box as the photo */}
      <div className="pointer-events-none absolute inset-0 translate-y-2 rounded-full bg-black opacity-15 blur-md" />
      <div
        className="pointer-events-none absolute inset-0 scale-[1.08] rounded-full bg-[#8B0000]/20 blur-xl dark:bg-[#8B0000]/30"
        style={{ animation: 'pulse-slow 4s ease-in-out infinite' }}
      />
      <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-[#8B0000]/30 bg-background/70 shadow-lg ring-1 ring-[#660000]/20 ring-offset-1 ring-offset-background dark:border-[#8B0000]/40 dark:ring-[#660000]/30">
        <img
          src="/images/author-profile-square.webp"
          alt="Author portrait"
          width={192}
          height={192}
          decoding="async"
          fetchPriority="high"
          className="block h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
