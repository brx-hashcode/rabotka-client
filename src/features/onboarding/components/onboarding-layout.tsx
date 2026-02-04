interface OnboardingLayoutProps {
  readonly children: React.ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12 px-4">{children}</div>
    </div>
  );
}
