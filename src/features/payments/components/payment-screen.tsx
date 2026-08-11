import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";


export function PaymentScreen({
  children,
  align = "center",
}: Readonly<{
  children: React.ReactNode;
  /**
   * `top` for the checkout itself: it opens with an action bar, and a bar that
   * floats in the middle of the viewport does not read as one.
   *
   * `center` stays the default for the short terminal states — success, error,
   * "already paid" — where a single centred message is the whole screen.
   */
  align?: "center" | "top";
}>) {
  return (
    <div
      className={cn(
        "relative flex min-h-dvh flex-col items-center overflow-hidden bg-background px-4",
        align === "top" ? "justify-start pb-16 pt-8" : "justify-center py-12",
      )}
    >
      {children}
    </div>
  );
}

export function PaymentScreenSkeleton() {
  // Mirrors the real layout's shapes and rhythm, so the swap to content does
  // not jump. Kept in step with PaymentMethodChooser.
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex flex-col items-center space-y-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-6 w-48 rounded-md" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>
      <Skeleton className="h-23 w-full rounded-xl" />
      <div className="space-y-2.5">
        <Skeleton className="h-3 w-40 rounded-md" />
        <Skeleton className="h-21 w-full rounded-xl" />
        <Skeleton className="h-21 w-full rounded-xl" />
      </div>
      <Skeleton className="h-12 w-full rounded-md" />
    </div>
  );
}
