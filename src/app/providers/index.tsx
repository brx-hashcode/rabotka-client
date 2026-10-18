import { ReactNode, useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
} from "@tanstack/react-query";
import { SessionLinkProvider } from "./session-link-provider";
import {
  getPolicyContent,
  policyQueryKey,
  POLICY_GC_TIME,
  POLICY_STALE_TIME,
} from "@/features/terms/policy-query";

type ProvidersProps = {
  children: ReactNode;
};

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      // A mutation that removes the thing a mounted page is showing (deleting
      // an offer) opts out: refetching everything would re-request what no
      // longer exists, and 404 before the page has navigated away. It cleans
      // up its own queries instead.
      if (mutation.meta?.skipGlobalInvalidation) return;
      queryClient.invalidateQueries();
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      retry: false,
    },
  },
});

export function getQueryClient(): QueryClient {
  return queryClient;
}

export function Providers({ children }: Readonly<ProvidersProps>) {
  useEffect(() => {
    queryClient
      .prefetchQuery({
        queryKey: policyQueryKey,
        queryFn: getPolicyContent,
        staleTime: POLICY_STALE_TIME,
        gcTime: POLICY_GC_TIME,
      })
      .catch(() => {
        // Best-effort warmup; Terms page still performs its own fallback chain.
      });
  }, []);

  return (
    <HelmetProvider>
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {/* Inside QueryClientProvider: it invalidates `profile/me` once the
                WhatsApp link's session cookie is in place. */}
            <SessionLinkProvider>{children}</SessionLinkProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </NuqsAdapter>
    </HelmetProvider>
  );
}
