import { useEffect } from "react";
import { type Post } from "@shared/schema";

interface MetaTagsProps {
  post?: Post;
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const DEFAULT_KEYWORDS = [
  // Primary SEO Keywords
  'dark','fiction','stories','short','psychological','horror','literary','online','writing','reading','experimental','creative','storytelling','prose','narrative',
  // Genre + Emotion Keywords
  'madness','obsession','decay','identity','violence','love','death','memory','loneliness','isolation','fear','dreams','devotion','mind','soul',
  // Audience and Context Keywords
  'magazine','journal','publishing','authors','writers','submissions','fictionhub','literature','readers','community',
  // Supporting Topical Keywords
  'gothic','darkness','melancholy','emotion','surreal','haunting','literaryfiction','experimentalwriting','aesthetic','atmosphere','introspective','contemporary','digitalmagazine','shortfiction'
].join(', ');

export function MetaTags({ post, title, description, image, url }: MetaTagsProps) {
  const pageTitle = post?.title || title || "Bubble’s Cafe";
  const pageDescription = post?.excerpt || description || "Bubble’s Cafe publishes dark, psychological and experimental short fiction — intimate stories of identity, obsessions, decay, and the violence of the human mind.";
  // Use a proper Open Graph image for page previews, not the favicon
  // Add version param to ensure cache-busting on updates
  const pageImage = image || "/og-image-1200x630.png?v=5";
  const pageUrl = url || window.location.href;

  useEffect(() => {
    try {
      // Update meta tags
      document.title = pageTitle;
      updateMetaTag("description", pageDescription);
      updateMetaTag("keywords", DEFAULT_KEYWORDS);

      // OpenGraph tags
      updateMetaTag("og:title", pageTitle);
      updateMetaTag("og:description", pageDescription);
      const absoluteImage = new URL(pageImage, window.location.origin).href;
      updateMetaTag("og:image", absoluteImage);
      updateMetaTag("og:image:secure_url", absoluteImage.replace("http://", "https://"));
      updateMetaTag("og:image:width", "1200");
      updateMetaTag("og:image:height", "630");
      updateMetaTag("og:url", pageUrl);
      updateMetaTag("og:type", "article");

      // Twitter Card tags
      updateMetaTag("twitter:card", "summary_large_image");
      updateMetaTag("twitter:title", pageTitle);
      updateMetaTag("twitter:description", pageDescription);
      updateMetaTag("twitter:image", new URL(pageImage, window.location.origin).href);
    } catch (error) {
      console.error("Error updating meta tags:", error);
    }
  }, [pageTitle, pageDescription, pageImage, pageUrl]);

  return null;
}

function updateMetaTag(name: string, content: string) {
  let element = document.querySelector(`meta[property="${name}"]`) || 
                document.querySelector(`meta[name="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    if (name.startsWith('og:')) {
      element.setAttribute('property', name);
    } else {
      element.setAttribute('name', name);
    }
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}