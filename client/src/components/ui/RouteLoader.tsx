import { LoadingScreen } from "./LoadingScreen";

/** Page-level loader: the site-wide LOADING animation (kept as a wrapper for existing imports). */
export default function RouteLoader({ label = "Loading" }: { label?: string; minHeight?: string }) {
  return <LoadingScreen label={`${label}…`} />;
}
