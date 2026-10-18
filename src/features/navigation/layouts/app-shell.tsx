import { BottomNav } from "../components/bottom-nav";
import { useProfileMe } from "@/hooks/use-profile-me";
import { useJobEvents } from "@/hooks/use-job-events";
import { useNotificationsSocket } from "@/hooks/use-notifications";
import { APP_SCROLL_ID } from "@/lib/app-scroll";
import { cn } from "@/lib/utils";

type AppShellProps = {
  readonly children: React.ReactNode;
  /**
   * Show the bottom tab bar. Off for focused flows (payments) and for
   * full-screen views like a conversation, which has its own header and
   * composer and nothing underneath.
   */
  readonly withNav?: boolean;
  /**
   * Let the document scroll instead of the shell's frame. Only for the chats:
   * they are `h-dvh` screens with their own scrolling thread, and their
   * keyboard handling inside the WhatsApp in-app browser is tuned to the
   * document (see the note above the return in pages/discussion.tsx).
   */
  readonly ownsViewport?: boolean;
};

export function AppShell({
  children,
  withNav = true,
  ownsViewport = false,
}: Readonly<AppShellProps>) {
  // Mounted here rather than on the two mission screens: the counterparty is
  // rarely looking at the matching screen when the other side acts, so the
  // listener has to be wherever they actually are. One socket for the whole
  // authenticated app.
  const { data: profile } = useProfileMe();
  useJobEvents(profile?.status === "ACTIVE");
  // Both roles have a bell, and the badge should move on whatever page the
  // profile is looking at.
  useNotificationsSocket(profile?.status === "ACTIVE");

  return (
    // From sm up the app becomes a deliberate centred column on a darker
    // field. sm (640px) rather than md (768px) on purpose: the column is only
    // 448px, so gutters appear long before md — md left iPad Mini portrait
    // (744px), 8" Android tablets and phone landscape as an unframed strip
    // floating in dead space, the exact thing this framing exists to fix.
    //
    // The separation is done by darkening the surround, never by changing the
    // column's own background. Six surfaces inside the shell (both sticky
    // headers, the claim-chat header and composer, the two search bars) paint
    // themselves bg-background to blend into the column; recolouring the
    // column seams every one of them.
    ownsViewport ? (
      <div className="sm:bg-app-surround">
        <div className="relative mx-auto min-h-svh w-full max-w-md bg-background sm:max-w-lg sm:shadow-soft">
          <main>{children}</main>
        </div>
      </div>
    ) : (
      // Every other screen behaves like the native app: the shell fills the
      // screen and only <main> scrolls, with the tab bar (when there is one)
      // laid out under it rather than `position: fixed` over the page. The
      // document itself never scrolls, so iPhone Safari's toolbar never
      // collapses mid-scroll — that collapse is what made headers and a fixed
      // bar shake and show a gap on a fast scroll. It was first done for the
      // tab screens only, and the payment flows kept shaking. See
      // lib/app-scroll for the scroll helpers this implies.
      <div className="fixed inset-0 overflow-hidden sm:bg-app-surround">
        <div className="relative mx-auto flex h-full w-full max-w-md flex-col bg-background sm:max-w-lg sm:shadow-soft">
          <main
            id={APP_SCROLL_ID}
            className={cn(
              "app-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain",
              withNav && "pb-6",
            )}
          >
            {children}
          </main>
          {withNav && <BottomNav />}
        </div>
      </div>
    )
  );
}
