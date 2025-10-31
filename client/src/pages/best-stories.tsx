import React from 'react';
import SEO from '@/components/SEO';

const curated = [
  { title: 'Nostalgia', slug: 'nostalgia', description: 'A haunting meditation on memory, identity, and the persistence of longing.' },
  { title: 'Blood', slug: 'blood', description: 'A visceral, psychological descent—intimate and unnerving.' },
];

export default function BestStoriesPage() {
  const canonical = '/best-stories';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Best Stories"
        description="A curated selection of Bubble’s Cafe’s most read and most loved short fiction."
        canonical={canonical}
        type="website"
      />
      <div className="container max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Best Stories</h1>
        <p className="text-muted-foreground mb-8">
          A handpicked collection of reader favorites and standout pieces.
        </p>
        <ul className="space-y-6">
          {curated.map((item) => (
            <li key={item.slug} className="border border-border rounded-lg p-4">
              <a href={`/reader/${encodeURIComponent(item.slug)}`} className="text-xl font-semibold underline hover:no-underline">
                {item.title}
              </a>
              <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}