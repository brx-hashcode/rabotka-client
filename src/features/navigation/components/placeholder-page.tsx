import type { LucideIcon } from "lucide-react";

type PlaceholderPageProps = {
  readonly title: string;
  readonly icon: LucideIcon;
};

export function PlaceholderPage({
  title,
  icon: Icon,
}: Readonly<PlaceholderPageProps>) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="bg-muted rounded-full p-6 mb-4">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-bold text-foreground mb-1">{title}</h1>
      <p className="text-muted-foreground max-w-sm">Bientôt disponible</p>
    </div>
  );
}
