import { ArrowLeft } from "lucide-react";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";

type ScreenHeaderProps = {
  readonly title: string;
  readonly subtitle?: string;
  readonly action?: React.ReactNode;
  readonly onBack?: () => void;
};

export function ScreenHeader({
  title,
  subtitle,
  action,
  onBack,
}: Readonly<ScreenHeaderProps>) {
  const scrolled = useScroll(0);

  return (
    <header
      className={cn(
        // Fully opaque: at /95 with a blur, scrolling content stayed visible
        // through the bar. Separation on scroll is a shadow, not a border.
        "sticky top-0 z-40 bg-background px-4 py-3 transition-shadow",
        scrolled && "shadow-soft",
      )}
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            aria-label="Retour"
            onClick={onBack}
            className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
    </header>
  );
}
