import { useEffect } from "react";
import { type Post } from "@shared/schema";

interface MetaTagsProps {
  post?: Post;
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function MetaTags({ post, title, description, image, url }: MetaTagsProps) {
  const pageTitle = post?.title || title || "Stories";
  const pageDescription = post?.excerpt || description || "Experience immersive stories that will keep you engaged.";
  const pageImage = image || "/og-image.svg";
  const pageUrl = url || window.location.href;

  useEffect(() => {
    try {
      // Update meta tags
      document.title = pageTitle;
      updateMetaTag("description", pageDescription);

      // OpenGraph tags
      updateMetaTag("og:title", pageTitle);
      updateMetaTag("og:description", pageDescription);
      updateMetaTag("og:image", new URL(pageImage, window.location.origin).href);
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