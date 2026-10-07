import { BottomNav } from "../components/bottom-nav";
import { useProfileMe } from "@/hooks/use-profile-me";
import { useJobEvents } from "@/hooks/use-job-events";
import { useNotificationsSocket } from "@/hooks/use-notifications";
import { APP_SCROLL_ID } from "@/lib/app-scroll";

type AppShellProps = {
  readonly children: React.ReactNode;
  /**
   * Hide the bottom tab bar. Use for full-screen views that own the whole
   * viewport — e.g. a claim conversation, which behaves like a WhatsApp chat
   * (its own header + composer, nothing underneath).
   */
  readonly withNav?: boolean;
};

export function AppShell({
  children,
  withNav = true,
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
    withNav ? (
      // Tab-bar screens behave like the native app: the shell fills the
      // screen and only <main> scrolls, with the bar laid out under it rather
      // than `position: fixed` over the page. The document itself never
      // scrolls, so iPhone Safari's toolbar never collapses mid-scroll — that
      // collapse is what made a fixed bar lag and show a gap under it on a
      // fast scroll. See lib/app-scroll for the scroll helpers this implies.
      <div className="fixed inset-0 overflow-hidden sm:bg-app-surround">
        <div className="relative mx-auto flex h-full w-full max-w-md flex-col bg-background sm:max-w-lg sm:shadow-soft">
          <main
            id={APP_SCROLL_ID}
            className="app-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-6"
          >
            {children}
          </main>
          <BottomNav />
        </div>
      </div>
    ) : (
      // Without the bar (chats, payment flows) the document scrolls as before:
      // the chat screens are tuned to it, keyboard included, inside the
      // WhatsApp in-app browser.
      <div className="sm:bg-app-surround">
        <div className="relative mx-auto min-h-svh w-full max-w-md bg-background sm:max-w-lg sm:shadow-soft">
          <main>{children}</main>
        </div>
      </div>
    )
  );
}
