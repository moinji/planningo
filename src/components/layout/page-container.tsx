import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  hasBottomNav?: boolean;
  hasHeader?: boolean;
  noPadding?: boolean;
}

export function PageContainer({
  children,
  className,
  hasBottomNav = true,
  hasHeader = true,
  noPadding = false,
}: PageContainerProps) {
  return (
    <main
      className={cn(
        "min-h-screen bg-background",
        hasHeader && "pt-14",
        hasBottomNav && "pb-20",
        !noPadding && "px-4",
        className
      )}
    >
      {children}
    </main>
  );
}
