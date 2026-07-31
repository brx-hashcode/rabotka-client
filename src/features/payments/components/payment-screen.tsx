import { Skeleton } from "@/components/ui/skeleton";


export function PaymentScreen({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      {children}
    </div>
  );
}

export function PaymentScreenSkeleton() {
  return (
    <div className="w-full max-w-sm space-y-4">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-[74px] w-full rounded-2xl" />
      <Skeleton className="h-[74px] w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-md" />
    </div>
  );
}
