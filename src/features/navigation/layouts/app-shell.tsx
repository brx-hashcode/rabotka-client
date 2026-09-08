import { BottomNav } from "../components/bottom-nav";
import { useProfileMe } from "@/hooks/use-profile-me";
import { useJobEvents } from "@/hooks/use-job-events";

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
    <div className="sm:bg-app-surround">
      <div className="relative mx-auto min-h-svh w-full max-w-md bg-background sm:max-w-lg sm:shadow-soft">
        {/* Clears the fixed nav with room to spare. pb-20 was a hair under the
            bar's real height, so the last card in a list sat half-hidden behind
            it — and raising the bar made that worse. */}
        <main className={withNav ? "pb-28" : undefined}>{children}</main>
        {withNav && <BottomNav />}
      </div>
    </div>
  );
}
