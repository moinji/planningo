"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, Map, Bell, User, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, labelKey: "home" },
  { href: "/trips", icon: Plane, labelKey: "trips" },
  { href: "/explore", icon: Map, labelKey: "explore" },
  { href: "/notifications", icon: Bell, labelKey: "notifications" },
  { href: "/profile", icon: User, labelKey: "profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("navigation");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-light">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span className="text-xs font-medium">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}
