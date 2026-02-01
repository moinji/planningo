"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  className?: string;
}

export function Header({
  title,
  showBack = false,
  rightAction,
  transparent = false,
  className,
}: HeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-14 flex items-center justify-between px-4",
        transparent ? "bg-transparent" : "bg-white border-b border-border-light",
        className
      )}
    >
      <div className="w-10">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-text-primary hover:text-primary transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {title && (
        <h1 className="text-lg font-semibold text-text-primary truncate">
          {title}
        </h1>
      )}

      <div className="w-10 flex justify-end">{rightAction}</div>
    </header>
  );
}

interface HeaderActionProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function HeaderAction({
  onClick,
  icon = <MoreVertical className="w-5 h-5" />,
  className,
}: HeaderActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-2 -mr-2 text-text-primary hover:text-primary transition-colors",
        className
      )}
    >
      {icon}
    </button>
  );
}
