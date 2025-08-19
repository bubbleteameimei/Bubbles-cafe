import { useEffect, useState } from 'react';
import StoryView from './story-view';

type ReaderPageProps = {
  params?: { slug?: string };
  isCommunityContent?: boolean;
};

export default function ReaderPage({ params }: ReaderPageProps) {
  const slugFromParams = params?.slug;
  const [slug, setSlug] = useState<string | null>(slugFromParams ?? null);

  useEffect(() => {
    if (!slugFromParams) {
      try {
        const stored = sessionStorage.getItem('selectedPostSlug');
        if (stored && typeof stored === 'string') setSlug(stored);
      } catch {}
    }
  }, [slugFromParams]);

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <p className="text-muted-foreground">No story selected.</p>
      </div>
    );
  }

  return (
    <div className="reader-page" data-reader-page>
      <div className="reader-container">
        <StoryView slug={slug} />
      </div>
    </div>
  );
}
