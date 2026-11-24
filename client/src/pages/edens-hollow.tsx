import { Link } from 'wouter';
import { Gamepad2 } from 'lucide-react';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';

/**
 * Eden's Hollow (experimental game). The game itself isn't built yet; this page used to
 * render nothing at all, so the sidebar link opened a blank screen.
 */
export default function EdensHollowPage() {
  return (
    <div className="min-h-[70vh] bg-background text-foreground flex items-center justify-center px-6 py-16">
      <SEO
        title="Eden’s Hollow – Coming Soon"
        description="Eden’s Hollow, a gothic visual novel from Bubble’s Cafe, is in the works."
        canonical="/edens-hollow"
        type="website"
      />
      <div className="max-w-md text-center space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Gamepad2 className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Eden’s Hollow</h1>
        <p className="text-muted-foreground leading-relaxed">
          A gothic visual novel is being written for this space. It isn’t playable yet. Check back soon.
        </p>
        <Button asChild>
          <Link href="/index">Read the stories meanwhile</Link>
        </Button>
      </div>
    </div>
  );
}
