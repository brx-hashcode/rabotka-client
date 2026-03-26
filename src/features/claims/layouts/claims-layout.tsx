import type { ReactNode } from "react";

type ClaimsLayoutProps = {
  children: ReactNode;
};

export const ClaimsLayout = ({ children }: ClaimsLayoutProps) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {children}
    </div>
  );
};
