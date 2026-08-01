import { BottomNav } from "../components/bottom-nav";

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
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md bg-background">
      <main className={withNav ? "pb-20" : undefined}>{children}</main>
      {withNav && <BottomNav />}
    </div>
  );
}
