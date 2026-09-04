import { useCallback, useState } from "react";
import {
  Gift,
  ChevronRight,
  Copy,
  Check,
  Share2,
  Link2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount, cn } from "@/lib/utils";
import { useReferral } from "@/hooks/use-referral";
import { referralAmounts } from "@/lib/referral-amounts";
import { referralContent as content } from "@/content/profile";

/** How long a "copied" confirmation stays up. */
const COPIED_FEEDBACK_MS = 2000;

type CopyTarget = "code" | "link" | null;

function referralLink(code: string): string {
  return `${globalThis.location.origin}/?ref=${code}`;
}

/** The link without its scheme — what a person would read aloud or recognise. */
function displayLink(code: string): string {
  return referralLink(code).replace(/^https?:\/\//, "");
}

function Step({
  index,
  title,
  body,
}: Readonly<{ index: number; title: string; body: string }>) {
  return (
    <li className="flex gap-3">
      <span className="bg-whatsapp text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
        {index}
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-foreground text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs leading-relaxed">{body}</p>
      </div>
    </li>
  );
}

/**
 * The user's parrainage code, and the ways to hand it to someone.
 *
 * One share action, backed by `navigator.share` — see `share` below. Copy is
 * the fallback that always works, on both the code and the link, because a
 * clipboard write is the only path that survives a blocked share sheet.
 */
export const ReferralSheetButton = ({ asRow = false }: { asRow?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState<CopyTarget>(null);

  // Only fetch once opened: this call mints the code on first use, and every
  // visit to the profile page should not.
  const { data, isLoading } = useReferral({ enabled: isOpen });

  const shareMessage = data ? content.shareMessage(referralLink(data.code)) : "";

  const copy = useCallback(async (text: string, target: CopyTarget) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(target);
      setTimeout(() => setCopied(null), COPIED_FEEDBACK_MS);
    } catch {
      // Clipboard is blocked outside a secure context or without permission.
      // The code is on screen and selectable, so this is a lost convenience,
      // not a lost feature.
    }
  }, []);

  /**
   * Hand the invitation to the OS share sheet.
   *
   * `navigator.share` is the right primary here: on the Android phones this
   * product runs on it opens the native sheet with WhatsApp already at the
   * front, plus SMS, and whatever else the person actually uses — one button
   * that covers more ground than a hardcoded `wa.me` link, and it posts into
   * the conversation they pick rather than making them choose a contact twice.
   *
   * It must be called directly from the click: browsers require a user
   * gesture, and awaiting anything first loses it. Falls back to `wa.me` where
   * the API does not exist, which is mostly desktop.
   */
  const share = useCallback(async () => {
    if (!data) return;

    if (!navigator.share) {
      globalThis.open(
        `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    try {
      await navigator.share({
        title: content.sheet.title,
        // Text only, no `url`: several Android targets drop one of the two, and
        // the link is already the tail of this message. Sending both is how you
        // get an invitation that arrives without its link.
        text: shareMessage,
      });
    } catch {
      // Includes the user simply dismissing the share sheet, which is not an
      // error and must not turn into one on screen.
    }
  }, [data, shareMessage]);

  const hasReferrals = (data?.joinedCount ?? 0) > 0;

  return (
    <>
      {asRow ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-muted text-foreground"
        >
          <Gift className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">{content.button}</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      ) : (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setIsOpen(true)}
        >
          <Gift className="h-4 w-4" />
          {content.button}
        </Button>
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        {/* One scroll container for the whole sheet: the header and the share
            button scroll away with the content instead of being pinned. On a
            short phone the pinned version left the steps a sliver tall between
            two fixed bars, which is the case that matters most here. */}
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <SheetHeader>
            <SheetTitle>{content.sheet.title}</SheetTitle>
            <SheetDescription>{content.sheet.description}</SheetDescription>
          </SheetHeader>

          {isLoading && (
            <div className="space-y-4 py-4">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          )}

          {!isLoading && data && (
            <div className="space-y-5 py-4">
              {/* The hero. Solid rather than tinted: the pale version put
                  green-on-pale-green text at a contrast nobody could read,
                  and this panel is the single thing the screen exists to hand
                  over. The whole panel is the copy target, not just the hint
                  under the code, since that is where the thumb already is. */}
              <button
                type="button"
                onClick={() => copy(data.code, "code")}
                className="bg-whatsapp w-full rounded-2xl px-5 py-6 text-center transition-opacity active:opacity-90"
              >
                <p className="text-primary-foreground/80 text-[11px] font-medium uppercase tracking-wider">
                  {content.yourCode}
                </p>
                <p className="text-primary-foreground mt-3 font-mono text-4xl font-bold tracking-[0.25em]">
                  {data.code}
                </p>
                <span
                  className={cn(
                    "mt-3 inline-flex items-center gap-1.5 text-xs font-medium",
                    copied === "code"
                      ? "text-primary-foreground"
                      : "text-primary-foreground/85",
                  )}
                >
                  {copied === "code" ? (
                    <>
                      <Check className="size-3.5" />
                      {content.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      {content.tapToCopy}
                    </>
                  )}
                </span>
              </button>

              {/* The link, as an action rather than as the raw URL that used
                  to sit at the bottom of the sheet — nobody can use a string
                  they cannot tap, and the scheme is noise to everyone. */}
              <button
                type="button"
                onClick={() => copy(referralLink(data.code), "link")}
                className="bg-card shadow-soft flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-opacity active:opacity-80"
              >
                <Link2 className="text-muted-foreground size-4 shrink-0" />
                <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs">
                  {displayLink(data.code)}
                </span>
                <span className="text-whatsapp shrink-0 text-xs font-medium">
                  {copied === "link" ? content.linkCopied : content.copyLink}
                </span>
              </button>

              {/* Three steps rather than a reward with a condition attached.
                  The condition is the same either way; as a sequence it reads
                  as how it works instead of as a catch. */}
              <ol className="bg-card shadow-soft space-y-4 rounded-lg p-4">
                {content
                  .steps(referralAmounts(data))
                  .map((step, i) => (
                    <Step
                      key={step.title}
                      index={i + 1}
                      title={step.title}
                      body={step.body}
                    />
                  ))}
              </ol>

              {/* Counters only once there is something to count. A pair of
                  big zeros is the first thing every new user would see, and
                  it reads as a program that does not work. */}
              {hasReferrals ? (
                <div className="bg-card shadow-soft rounded-lg p-4">
                  <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wide">
                    {content.stats.title}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-foreground text-xl font-semibold">
                        {data.joinedCount}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {content.stats.joined}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground text-xl font-semibold">
                        {data.rewardedCount}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {content.stats.rewarded}
                      </p>
                    </div>
                    <div>
                      <p className="text-whatsapp text-xl font-semibold">
                        {formatAmount(data.totalEarnedFcfa)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {content.stats.earned}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground px-1 text-center text-xs">
                  {content.emptyState}
                </p>
              )}

              <Button
                variant="whatsapp"
                size="lg"
                className="w-full gap-2"
                onClick={share}
              >
                <Share2 className="size-4" />
                {content.share}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
