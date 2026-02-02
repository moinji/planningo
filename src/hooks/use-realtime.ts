"use client";

import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type TableName =
  | "schedules"
  | "expenses"
  | "expense_participants"
  | "checklists"
  | "checklist_items"
  | "places"
  | "trip_members";

interface UseRealtimeOptions {
  tripId: string;
  tables?: TableName[];
  enabled?: boolean;
}

const DEFAULT_TABLES: TableName[] = [
  "schedules",
  "expenses",
  "expense_participants",
  "checklists",
  "checklist_items",
  "places",
  "trip_members",
];

// Query key mapping for each table
const TABLE_QUERY_KEYS: Record<TableName, string> = {
  schedules: "schedules",
  expenses: "expenses",
  expense_participants: "expenses",
  checklists: "checklists",
  checklist_items: "checklists",
  places: "places",
  trip_members: "trips",
};

export function useRealtime({
  tripId,
  tables = DEFAULT_TABLES,
  enabled = true,
}: UseRealtimeOptions) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleChange = useCallback(
    (
      table: TableName,
      payload: RealtimePostgresChangesPayload<Record<string, unknown>>
    ) => {
      const queryKey = TABLE_QUERY_KEYS[table];

      // Invalidate the relevant query to refetch data
      queryClient.invalidateQueries({
        queryKey: [queryKey, tripId],
      });

      // For nested tables, also invalidate parent
      if (table === "expense_participants") {
        queryClient.invalidateQueries({
          queryKey: ["expenses", tripId],
        });
      }

      if (table === "checklist_items") {
        queryClient.invalidateQueries({
          queryKey: ["checklists", tripId],
        });
      }

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log(`[Realtime] ${table} ${payload.eventType}:`, payload);
      }
    },
    [queryClient, tripId]
  );

  useEffect(() => {
    if (!enabled || !tripId) return;

    let channel: RealtimeChannel | null = null;

    const setupRealtime = () => {
      channel = supabase.channel(`trip:${tripId}`);

      // Subscribe to changes for each table
      tables.forEach((table) => {
        channel = channel!.on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: table,
            filter: table === "trip_members"
              ? `trip_id=eq.${tripId}`
              : table === "expense_participants"
              ? undefined // Will filter by expense's trip_id
              : table === "checklist_items"
              ? undefined // Will filter by checklist's trip_id
              : `trip_id=eq.${tripId}`,
          },
          (payload) => handleChange(table, payload)
        );
      });

      channel.subscribe((status) => {
        if (process.env.NODE_ENV === "development") {
          console.log(`[Realtime] Channel status: ${status}`);
        }
      });
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase, tripId, tables, enabled, handleChange]);
}

// Presence hook for seeing who's online
interface PresenceState {
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  online_at: string;
  current_view?: string;
}

interface UsePresenceOptions {
  tripId: string;
  userId: string;
  nickname: string;
  avatarUrl?: string | null;
  currentView?: string;
  enabled?: boolean;
}

export function usePresence({
  tripId,
  userId,
  nickname,
  avatarUrl,
  currentView,
  enabled = true,
}: UsePresenceOptions) {
  const supabase = createClient();

  useEffect(() => {
    if (!enabled || !tripId || !userId) return;

    let channel: RealtimeChannel | null = null;

    const setupPresence = async () => {
      channel = supabase.channel(`presence:${tripId}`, {
        config: {
          presence: {
            key: userId,
          },
        },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel!.presenceState<PresenceState>();
          if (process.env.NODE_ENV === "development") {
            console.log("[Presence] Sync:", state);
          }
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          if (process.env.NODE_ENV === "development") {
            console.log("[Presence] Join:", key, newPresences);
          }
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          if (process.env.NODE_ENV === "development") {
            console.log("[Presence] Leave:", key, leftPresences);
          }
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel!.track({
              user_id: userId,
              nickname,
              avatar_url: avatarUrl,
              online_at: new Date().toISOString(),
              current_view: currentView,
            });
          }
        });
    };

    setupPresence();

    return () => {
      if (channel) {
        channel.untrack();
        supabase.removeChannel(channel);
      }
    };
  }, [supabase, tripId, userId, nickname, avatarUrl, currentView, enabled]);
}
