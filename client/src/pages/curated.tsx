import React from 'react';
import SEO from '@/components/SEO';
import { PersonalizedRecommendations } from '@/components/PersonalizedRecommendations';

export default function CuratedForYouPage() {
  const canonical = '/curated';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Curated for You"
        description="Personalized short fiction suggestions based on your reading preferences."
        canonical={canonical}
        type="website"
      />
      <div className="container max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Curated for You</h1>
        <p className="text-muted-foreground mb-6">
          A personalized selection of stories tailored to your themes and reading history.
        </p>
        <PersonalizedRecommendations limit={6} preferredThemes={[]} showHeading={false} />
      </div>
    </div>
  );
}