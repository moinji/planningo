"use client";

import { useTranslations } from "next-intl";
import { Settings, ChevronRight, Globe, Bell, Moon, HelpCircle, MessageSquare, Info } from "lucide-react";
import { Header, HeaderAction } from "@/components/layout";
import { Avatar, Card } from "@/components/ui";

const menuItems = [
  { icon: Globe, labelKey: "profile.language", href: "/settings/language" },
  { icon: Bell, labelKey: "profile.notifications", href: "/settings/notifications" },
  { icon: Moon, labelKey: "profile.darkMode", href: "/settings/theme" },
  { icon: HelpCircle, labelKey: "profile.help", href: "/help" },
  { icon: MessageSquare, labelKey: "profile.feedback", href: "/feedback" },
  { icon: Info, labelKey: "profile.about", href: "/about" },
];

export default function ProfilePage() {
  const t = useTranslations();

  // Placeholder user data
  const user = {
    nickname: "여행자",
    email: "traveler@example.com",
    avatarUrl: null,
  };

  return (
    <>
      <Header
        title={t("profile.title")}
        rightAction={
          <HeaderAction
            icon={<Settings className="w-5 h-5" />}
            onClick={() => console.log("Settings")}
          />
        }
      />

      <main className="px-4 py-4">
        {/* Profile Card */}
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={user.avatarUrl || undefined}
              name={user.nickname}
              size="xl"
            />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-text-primary">
                {user.nickname}
              </h2>
              <p className="text-sm text-text-secondary">{user.email}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted" />
          </div>
        </Card>

        {/* Settings Menu */}
        <Card padding="none">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.labelKey}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-surface transition-colors ${
                  index !== menuItems.length - 1 ? "border-b border-border-light" : ""
                }`}
                onClick={() => console.log(item.href)}
              >
                <Icon className="w-5 h-5 text-text-secondary" />
                <span className="flex-1 text-text-primary">
                  {t(item.labelKey)}
                </span>
                <ChevronRight className="w-5 h-5 text-text-muted" />
              </button>
            );
          })}
        </Card>

        {/* Version */}
        <p className="text-center text-sm text-text-muted mt-8">
          {t("profile.version")} 0.1.0
        </p>
      </main>
    </>
  );
}
