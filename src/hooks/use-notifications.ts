"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores";
import type { Notification } from "@/types";

const NOTIFICATIONS_QUERY_KEY = "notifications";

export function useNotifications() {
  const supabase = createClient();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
  });
}

export function useUnreadCount() {
  const supabase = createClient();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, user?.id, "unread-count"],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
}

export function useMarkAsRead() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATIONS_QUERY_KEY, user?.id],
      });
    },
  });
}

export function useMarkAllAsRead() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATIONS_QUERY_KEY, user?.id],
      });
    },
  });
}

export function useDeleteNotification() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATIONS_QUERY_KEY, user?.id],
      });
    },
  });
}

// Notification type icons and labels
export const NOTIFICATION_CONFIG: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  trip_invite: { icon: "✉️", label: "여행 초대", color: "primary" },
  schedule_change: { icon: "📅", label: "일정 변경", color: "secondary" },
  expense_added: { icon: "💰", label: "지출 추가", color: "warning" },
  checklist_update: { icon: "✅", label: "체크리스트 업데이트", color: "success" },
  member_joined: { icon: "👋", label: "멤버 참여", color: "primary" },
  reminder: { icon: "🔔", label: "알림", color: "default" },
};
