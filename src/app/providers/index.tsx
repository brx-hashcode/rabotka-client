import { ReactNode } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CsrfProvider } from "./csrf-provider";
import { CookieConsent } from "@/components/cookie-consent";

type ProvidersProps = {
  children: ReactNode;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
    },
  },
});

export function Providers({ children }: Readonly<ProvidersProps>) {
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
