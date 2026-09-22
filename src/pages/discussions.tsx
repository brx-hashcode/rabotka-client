import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { MessagesSquare, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { discussionsContent } from "@/content/discussions";
import { DiscussionRow } from "@/features/discussions/components/discussion-row";
import { tapFeedback } from "@/lib/haptics";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import type { Discussion } from "@/lib/api/discussions-controller";
import {
  useDiscussions,
  useDiscussionsSocket,
  useHideDiscussion,
} from "@/hooks/use-discussions";

type Filter = "all" | "unread";

/**
 * Accent- and case-insensitive, so "helene" finds "Hélène" — which is how
 * people type a name into a search box on a phone.
 */
function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function matches(discussion: Discussion, query: string): boolean {
  if (!query) return true;
  const q = fold(query.trim());
  return [
    discussion.counterpartName,
    discussion.jobTitle ?? "",
    discussion.lastMessagePreview ?? "",
  ].some((field) => fold(field).includes(q));
}

export default function Discussions() {
  const navigate = useNavigate();
  const { data, isLoading } = useDiscussions();
  const hide = useHideDiscussion();
  useDiscussionsSocket(true);

  const scrolled = useScroll(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [actionsFor, setActionsFor] = useState<Discussion | null>(null);
  const [confirming, setConfirming] = useState(false);

  const content = discussionsContent.list;
  const all = data?.data ?? [];
  const unreadTotal = all.filter((d) => d.unreadCount > 0).length;

  const visible = useMemo(
    () =>
      all.filter(
        (d) =>
          (filter === "all" || d.unreadCount > 0) && matches(d, query),
      ),
    [all, filter, query],
  );

  const closeActions = () => {
    setActionsFor(null);
    setConfirming(false);
  };

  const confirmDelete = () => {
    if (!actionsFor) return;
    // Two steps, and the second one says what it means. "Supprimer" on
    // WhatsApp clears the thread for you only; people who know that expect it,
    // people who do not deserve to be told before they tap.
    if (!confirming) {
      setConfirming(true);
      return;
    }
    const target = actionsFor;
    closeActions();
    tapFeedback();
    hide.mutate(target.id, {
      onSuccess: () => toast.success(content.deleted),
      onError: () => toast.error(content.deleteFailed),
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Large title, search, filters: the WhatsApp head. ──
          Sticky, with the same tokens as ScreenHeader: fully opaque (a
          translucent bar let rows show through), z-40, and a shadow that only
          appears once something has scrolled under it. The rest of the app
          keeps its header in place; this one scrolled away with the list, so
          search and the filters left the screen just when a long list needs
          them. */}
      <header
        className={cn(
          "sticky top-0 z-40 bg-background px-4 pb-2 pt-4 transition-shadow",
          scrolled && "shadow-soft",
        )}
      >
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">
          {content.title}
        </h1>

        <label className="mt-3 flex h-10 items-center gap-2 rounded-full bg-muted px-3.5 text-muted-foreground">
          <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={content.searchPlaceholder}
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              aria-label="Effacer la recherche"
              onClick={() => setQuery("")}
              className="flex h-6 w-6 items-center justify-center rounded-full active:bg-background/60"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>

        <div className="mt-3 flex gap-2">
          {(
            [
              ["all", content.filterAll, null],
              ["unread", content.filterUnread, unreadTotal],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                tapFeedback();
                setFilter(key);
              }}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                filter === key
                  ? "bg-whatsapp/15 text-whatsapp-dark"
                  : "bg-muted text-muted-foreground active:bg-muted/70",
              )}
            >
              {label}
              {count ? <span className="ml-1 tabular-nums">{count}</span> : null}
            </button>
          ))}
        </div>
      </header>

      {isLoading && (
        <div className="px-4 pt-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="h-[52px] w-[52px] rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && all.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-6">
            <MessagesSquare className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="mb-1 text-lg font-semibold">{content.emptyTitle}</p>
          <p className="max-w-sm text-muted-foreground">{content.emptyDescription}</p>
        </div>
      )}

      {/* Distinct from "no conversations at all": the person has threads,
          their filter or search just matches none of them, and the fix is to
          change the filter rather than to go and find somebody to talk to. */}
      {!isLoading && all.length > 0 && visible.length === 0 && (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          {query ? content.noSearchResult : content.noUnread}
        </p>
      )}

      <ul className="pb-24">
        {visible.map((discussion) => (
          <DiscussionRow
            key={discussion.id}
            discussion={discussion}
            onOpen={() => navigate(`/discussions/${discussion.id}`)}
            onActions={() => setActionsFor(discussion)}
          />
        ))}
      </ul>

      {/* ── Row actions, opened by a long press or a right-click. ── */}
      <Drawer open={actionsFor !== null} onOpenChange={(open) => !open && closeActions()}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md">
            <DrawerHeader className="text-center">
              <DrawerTitle>{actionsFor?.counterpartName}</DrawerTitle>
              <DrawerDescription>
                {confirming ? content.deleteExplain : (actionsFor?.jobTitle ?? "")}
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={hide.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {confirming ? content.deleteConfirm : content.delete}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Annuler</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
