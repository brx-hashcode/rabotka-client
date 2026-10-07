import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { onPageScroll, scrollTop } from "@/lib/app-scroll";
import { cn } from "@/lib/utils";

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(scrollTop() > 0);
    onScroll();
    return onPageScroll(onScroll);
  }, []);

  return scrolled;
}

type Props = {
  /** Search screen this header opens. Employer → workers, worker → job offers. */
  readonly to?: string;
  readonly placeholder?: string;
  /** Extra action rendered after the filter button (e.g. saved offers). */
  readonly trailing?: React.ReactNode;
  /**
   * `onLime`: just the white search pill, filters inside it, for BrandHero —
   * which owns the sticky bar and the trailing action, so neither is here.
   */
  readonly variant?: "default" | "onLime";
};

/**
 * Home search bar. The "field" is deliberately a button, not an input: tapping it
 * opens the dedicated search screen, whose own input is autofocused so the
 * keyboard appears to stay up. Shared by both home variants.
 */
export function HomeHeader({
  to = "/recherche",
  placeholder = "Nom, mots-clés...",
  trailing,
  variant = "default",
}: Readonly<Props>) {
  const navigate = useNavigate();
  const scrolled = useScrolled();

  const goToSearch = () => navigate(to);

  if (variant === "onLime") {
    return (
      <div className="flex h-12 items-center gap-2 rounded-2xl bg-card pl-1 pr-1.5 shadow-soft">
        <button
          type="button"
          onClick={goToSearch}
          className="flex h-full min-w-0 flex-1 items-center gap-2.5 rounded-xl pl-3 text-left text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="min-w-0 truncate">{placeholder}</span>
        </button>
        <button
          type="button"
          aria-label="Filtres"
          onClick={goToSearch}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lime/70 text-lime-foreground active:bg-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-background px-4 py-3 transition-shadow",
        scrolled && "shadow-soft",
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goToSearch}
          className="relative flex h-11 flex-1 items-center overflow-hidden rounded-md bg-secondary pl-10 pr-4 text-left text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          {/* This LOOKS like a placeholder but is real text in a button, so it
              wraps where an <input> would clip — and the button is a fixed h-11,
              so the second line spilled out of the pill. `min-w-0` is the part
              that does the work: a flex item will not shrink below its content
              width without it, so `truncate` alone would not have helped. */}
          <span className="min-w-0 truncate">{placeholder}</span>
        </button>

        <button
          type="button"
          aria-label="Filtres"
          onClick={goToSearch}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-md",
            "bg-secondary text-secondary-foreground",
            "transition-colors hover:bg-secondary/80 active:bg-secondary/70",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40",
          )}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>

        {trailing}
      </div>
    </header>
  );
}
