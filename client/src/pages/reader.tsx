import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import StoryView from "./story-view";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";
import "@/styles/reader-fixes.css";
import "@/styles/reader.css";

interface ReaderRouteProps {
  params?: { slug?: string };
  isCommunityContent?: boolean;
}

export default function ReaderPage(props: ReaderRouteProps = {}) {
  const [, setLocation] = useLocation();
  const [storageSlug, setStorageSlug] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("selectedPostSlug");
      setStorageSlug(saved);
    } catch {}
  }, []);

  const slug = useMemo(() => {
    const routeSlug = props?.params?.slug;
    if (routeSlug && String(routeSlug).trim()) return String(routeSlug);
    if (storageSlug && storageSlug.trim()) return storageSlug.trim();
    return "";
  }, [props?.params?.slug, storageSlug]);

  if (!slug) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-semibold mb-2">No story selected</h1>
          <p className="text-muted-foreground mb-6">Please pick a story to read from the stories list.</p>
          <Button onClick={() => setLocation("/stories")} className="inline-flex items-center gap-2">
            <Book className="h-4 w-4" />
            Browse Stories
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="reader-page">
      <StoryView slug={slug} />
    </div>
  );
}

