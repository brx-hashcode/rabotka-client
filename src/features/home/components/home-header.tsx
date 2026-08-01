import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return scrolled;
}

type Props = {
  /** Search screen this header opens. Employer → workers, worker → job offers. */
  readonly to?: string;
  readonly placeholder?: string;
  /** Extra action rendered after the filter button (e.g. saved offers). */
  readonly trailing?: React.ReactNode;
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
}: Readonly<Props>) {
  const navigate = useNavigate();
  const scrolled = useScrolled();

  const goToSearch = () => navigate(to);

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
          className="relative flex h-11 flex-1 items-center rounded-md bg-secondary pl-10 pr-4 text-left text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          {placeholder}
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
