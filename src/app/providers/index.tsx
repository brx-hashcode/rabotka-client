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
import { CsrfProvider } from "./csrf-provider";
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
  // The client runs inside WhatsApp's in-app webview, which never fires
  // window focus/reconnect events — so React Query's usual refetch triggers
  // never happen and mutated data stays stale until a manual page reload.
  // Invalidate the whole cache after every successful mutation so the pages
  // affected by it revalidate on their own. This cache-level callback runs in
  // addition to each mutation's own onSuccess (a defaultOptions.mutations
  // callback would instead be overridden by hooks that define their own).
  mutationCache: new MutationCache({
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      // Refetch stale queries when a page mounts, so navigating to a screen
      // after a mutation (which just invalidated the cache) shows fresh data
      // instead of the pre-mutation cache. Within staleTime, ordinary
      // re-navigation is still served from cache.
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
    <CsrfProvider>
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
    </CsrfProvider>
    </HelmetProvider>
  );
}
