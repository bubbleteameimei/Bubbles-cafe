/**
 * Shared badge tint mapping used by both server and client to keep UI consistent.
 * Returns a Tailwind class string based on a normalized uppercase theme key.
 */
export function getBadgeTint(themeKeyRaw: string | undefined | null): string {
  const themeKey = String(themeKeyRaw || '').toUpperCase();

  switch (themeKey) {
    // Core mappings with varied palette
    case 'DEATH': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
    case 'BODY_HORROR': return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700';
    case 'SUPERNATURAL': return 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700';
    case 'PSYCHOLOGICAL': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700';
    case 'EXISTENTIAL': return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700';
    case 'HORROR': return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-700';

    // Extended variety
    case 'STALKING': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700';
    case 'CANNIBALISM': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
    case 'PSYCHOPATH': return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-700';
    case 'DOPPELGANGER': return 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700';
    case 'VEHICULAR': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700';
    case 'PARASITE': return 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-700';
    case 'TECHNOLOGICAL': return 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700';
    case 'COSMIC': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
    case 'UNCANNY': return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700';
    case 'GOTHIC': return 'bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-900/30 dark:text-stone-300 dark:border-stone-700';
    case 'CURSED_OBJECT': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
    case 'OCCULT': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
    case 'URBAN_HORROR': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
    case 'SUICIDE': return 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900/30 dark:text-zinc-300 dark:border-zinc-700';
    case 'CONTAGION': return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700';

    // Additional keys used across the app
    case 'FOLK_HORROR': return 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-700';
    case 'SLASHER': return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700';
    case 'MONSTER': return 'bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-900/30 dark:text-stone-300 dark:border-stone-700';
    case 'ZOMBIE': return 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-700';
    case 'VAMPIRE': return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700';
    case 'WEREWOLF': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700';
    case 'PARANORMAL': return 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700';
    case 'DREAM_HORROR': return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700';
    case 'TIME_HORROR': return 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700';
    case 'APOCALYPTIC': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
    case 'SCIENCE_HORROR': return 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700';

    default:
      return 'bg-primary/10 text-foreground border-primary/20 dark:bg-primary/10 dark:text-foreground dark:border-primary/20';
  }
}