"use client";

import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import { Header, HeaderAction } from "@/components/layout";
import { EmptyState } from "@/components/common";

export default function NotificationsPage() {
  const t = useTranslations();

  return (
    <>
      <Header
        title={t("notification.title")}
        rightAction={
          <HeaderAction
            icon={<span className="text-sm text-primary">{t("notification.markAllRead")}</span>}
            onClick={() => console.log("Mark all read")}
          />
        }
      />
      <main className="px-4 py-4">
        <EmptyState
          icon={<Bell className="w-16 h-16" />}
          title={t("notification.noNotifications")}
          description="새로운 알림이 없어요"
        />
      </main>
    </>
  );
}
