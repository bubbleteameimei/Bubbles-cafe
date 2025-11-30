import { useMemo } from 'react';

/**
 * Derive SEO defaults (title, description, robots flags, canonical)
 * based on the current location path.
 */
export interface RouteSeo {
  title?: string;
  description?: string;
  canonical: string;
  noindex: boolean;
  nofollow: boolean;
}

export function useRouteSeo(path: string | undefined | null): RouteSeo {
  return useMemo(() => {
    const locationStr = path || '/';
    const canonical = locationStr || '/';

    const pathForSeo = locationStr || '/';
    let seoTitle: string | undefined;
    let seoDescription: string | undefined;
    let seoNoindex = false;
    let seoNofollow = false;

    if (pathForSeo === '/') {
      seoTitle = 'Bubble’s Cafe';
      seoDescription =
        "Bubble's Cafe publishes dark, psychological, and experimental fiction — intimate stories of identity, obsessions, decay, and the violence of the human mind.";
    } else if (pathForSeo.startsWith('/stories') || pathForSeo.startsWith('/index')) {
      seoTitle = 'Index';
      seoDescription =
        'Browse the index of short fiction from Bubble’s Cafe — psychological and experimental stories of identity, obsession, and the strange grace of decay.';
    } else if (pathForSeo.startsWith('/reader')) {
      // Reader page sets its own page-level SEO (Article);
      // we only provide the canonical from here.
    } else if (pathForSeo.startsWith('/about')) {
      seoTitle = 'About';
      seoDescription =
        'Bubble’s Cafe publishes dark psychological and experimental short fiction. We explore stories that examine the mind, memory, and the complexities of human emotion.';
    } else if (pathForSeo.startsWith('/contact')) {
      seoTitle = 'Contact';
      seoDescription = 'Reach Bubble’s Cafe. For inquiries, collaborations, or permissions, contact me.';
    } else if (pathForSeo.startsWith('/privacy')) {
      seoTitle = 'Privacy Policy';
      seoDescription = 'Privacy Policy for Bubble’s Cafe.';
    } else if (pathForSeo.startsWith('/install')) {
      seoTitle = 'Install App';
      seoDescription = "Install the Bubble’s Cafe app for a fast, immersive reading experience.";
    } else if (pathForSeo.startsWith('/community')) {
      seoTitle = 'Community';
      seoDescription = 'Explore and engage with the Bubble’s Cafe community.';
    } else if (pathForSeo.startsWith('/submit-story')) {
      seoTitle = 'Submit Story';
      seoDescription =
        'Submit your short fiction to Bubble’s Cafe. We welcome macabre works that explore identity, emotion, and the horror.';
    } else if (pathForSeo.startsWith('/edit-story')) {
      seoTitle = 'Edit Story';
      seoDescription = 'Edit your submitted story.';
      seoNoindex = true;
    } else if (pathForSeo.startsWith('/search')) {
      seoTitle = 'Search';
      seoDescription = "Search Bubble’s Cafe for short fiction by theme, tone, or title.";
      seoNoindex = true;
    } else if (pathForSeo.startsWith('/admin')) {
      seoTitle = 'Admin';
      seoDescription = 'Site administration.';
      seoNoindex = true;
      seoNofollow = true;
    } else if (pathForSeo.startsWith('/auth')) {
      seoTitle = 'Sign In';
      seoDescription = 'Authenticate to Bubble’s Cafe.';
      seoNoindex = true;
      seoNofollow = true;
    } else if (pathForSeo.startsWith('/reset-password')) {
      seoTitle = 'Reset Password';
      seoDescription = 'Reset your Bubble’s Cafe password.';
      seoNoindex = true;
    } else if (pathForSeo.startsWith('/profile')) {
      seoTitle = 'Profile';
      seoDescription =
        'Manage your Bubble’s Cafe account — track your reading activity, bookmarks, and preferences.';
      seoNoindex = true;
    } else if (pathForSeo.startsWith('/bookmarks')) {
      seoTitle = 'Bookmarks';
      seoDescription =
        'Your saved short fiction from Bubble’s Cafe — revisit stories you’ve marked as favourites.';
      seoNoindex = true;
    } else if (pathForSeo.startsWith('/notifications')) {
      seoTitle = 'Notifications';
      seoDescription = 'View personalized story recommendations and updates from Bubble’s Cafe.';
      seoNoindex = true;
    } else if (pathForSeo.startsWith('/recommendations')) {
      seoTitle = 'Recommendations';
      seoDescription = 'View personalized story recommendations and updates from Bubble’s Cafe.';
      seoNoindex = true;
    } else if (pathForSeo.startsWith('/settings/')) {
      seoTitle = 'Settings';
      seoDescription =
        'Adjust your Bubble’s Cafe reading experience — update display settings, preferences, and saved data.';
      seoNoindex = true;
    } else if (pathForSeo.startsWith('/legal/copyright')) {
      seoTitle = 'Copyright';
      seoDescription = 'Copyright information.';
    } else if (pathForSeo.startsWith('/legal/terms')) {
      seoTitle = 'Terms of Service';
      seoDescription = 'Terms of service for Bubble’s Cafe.';
    } else if (pathForSeo.startsWith('/legal/cookie-policy')) {
      seoTitle = 'Cookie Policy';
      seoDescription = 'Cookie policy for Bubble’s Cafe.';
    }

    return {
      title: seoTitle,
      description: seoDescription,
      canonical,
      noindex: seoNoindex,
      nofollow: seoNofollow,
    };
  }, [path]);
}