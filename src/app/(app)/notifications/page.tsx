"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Bell, Trash2, Check } from "lucide-react";
import toast from "react-hot-toast";
import { Header, HeaderAction } from "@/components/layout";
import { Card, Badge } from "@/components/ui";
import { EmptyState, LoadingScreen } from "@/components/common";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  NOTIFICATION_CONFIG,
} from "@/hooks";
import type { Notification, NotificationType } from "@/types";

export default function NotificationsPage() {
  const t = useTranslations();
  const router = useRouter();
  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      toast.success("모든 알림을 읽음 처리했습니다.");
    } catch {
      toast.error("처리에 실패했습니다.");
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      await markAsRead.mutateAsync(notification.id);
    }

    // Navigate based on notification type
    const data = notification.data as Record<string, string>;
    if (data?.trip_id) {
      router.push(`/trips/${data.trip_id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      await deleteNotification.mutateAsync(notificationId);
      toast.success("알림이 삭제되었습니다.");
    } catch {
      toast.error("삭제에 실패했습니다.");
    }
  };

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Header
        title={t("notification.title")}
        rightAction={
          unreadCount > 0 ? (
            <HeaderAction
              icon={
                <span className="text-sm text-primary flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  {t("notification.markAllRead")}
                </span>
              }
              onClick={handleMarkAllRead}
            />
          ) : undefined
        }
      />
      <main className="px-4 py-4">
        {notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
                onDelete={(e) => handleDelete(e, notification.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Bell className="w-16 h-16" />}
            title={t("notification.noNotifications")}
            description="새로운 알림이 없어요"
          />
        )}
      </main>
    </>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function NotificationItem({
  notification,
  onClick,
  onDelete,
}: NotificationItemProps) {
  const config = NOTIFICATION_CONFIG[notification.type as NotificationType] || NOTIFICATION_CONFIG.reminder;

  return (
    <Card
      padding="sm"
      className={`cursor-pointer transition-colors hover:bg-surface/50 ${
        !notification.is_read ? "border-l-4 border-l-primary bg-primary/5" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-2xl">{config.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={config.color as "primary" | "secondary" | "default"} size="sm">
                  {config.label}
                </Badge>
                {!notification.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <h4 className="font-semibold text-text-primary">
                {notification.title}
              </h4>
            </div>
            <button
              onClick={onDelete}
              className="p-1 text-text-muted hover:text-error transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
            {notification.message}
          </p>

          <p className="text-xs text-text-muted mt-2">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
              locale: ko,
            })}
          </p>
        </div>
      </div>
    </Card>
  );
}
