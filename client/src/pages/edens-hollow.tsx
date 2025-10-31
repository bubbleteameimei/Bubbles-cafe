import React from 'react';
import SEO from '@/components/SEO';

export default function EdensHollowPage() {
  const canonical = '/edens-hollow';
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Play Eden’s Hollow! – Gothic Visual Novel"
        description="Play Eden’s Hollow — a gothic visual novel experience from Bubble’s Cafe."
        canonical={canonical}
        type="website"
      />
      {/* Intentionally minimal (no visible UI impact) */}
    </div>
  );
}