import { ReactNode, useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CsrfProvider } from "./csrf-provider";
import { CookieConsent } from "@/components/cookie-consent";
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
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
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
            <CookieConsent />
            {children}
          </TooltipProvider>
        </QueryClientProvider>
      </NuqsAdapter>
    </CsrfProvider>
    </HelmetProvider>
  );
}
