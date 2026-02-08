import { useEffect, type ReactNode } from "react";
import { useCsrfStore } from "@/stores/csrf-store";

type CsrfProviderProps = {
  children: ReactNode;
};

export function CsrfProvider({ children }: Readonly<CsrfProviderProps>) {
  useEffect(() => {
    useCsrfStore.getState().fetchAndSetToken();
  }, []);

  return <>{children}</>;
}
