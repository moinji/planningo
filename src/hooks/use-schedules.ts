"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores";
import type { Schedule, ScheduleWithPlace } from "@/types";

const SCHEDULES_QUERY_KEY = "schedules";

export function useSchedules(tripId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: [SCHEDULES_QUERY_KEY, tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedules")
        .select(`
          *,
          place:places(*)
        `)
        .eq("trip_id", tripId)
        .order("date", { ascending: true })
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as ScheduleWithPlace[];
    },
    enabled: !!tripId,
  });
}

export function useSchedulesByDate(tripId: string, date: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: [SCHEDULES_QUERY_KEY, tripId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedules")
        .select(`
          *,
          place:places(*)
        `)
        .eq("trip_id", tripId)
        .eq("date", date)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as ScheduleWithPlace[];
    },
    enabled: !!tripId && !!date,
  });
}

interface CreateScheduleInput {
  trip_id: string;
  date: string;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  place_id?: string;
  assigned_to?: string[];
}

export function useCreateSchedule() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (input: CreateScheduleInput) => {
      if (!user) throw new Error("Not authenticated");

      // Get current max order_index for the date
      const { data: existing } = await supabase
        .from("schedules")
        .select("order_index")
        .eq("trip_id", input.trip_id)
        .eq("date", input.date)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrderIndex = existing && existing.length > 0
        ? (existing[0].order_index || 0) + 1
        : 0;

      const { data, error } = await supabase
        .from("schedules")
        .insert({
          ...input,
          order_index: nextOrderIndex,
          created_by: user.id,
        })
        .select(`
          *,
          place:places(*)
        `)
        .single();

      if (error) throw error;
      return data as ScheduleWithPlace;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [SCHEDULES_QUERY_KEY, data.trip_id]
      });
    },
  });
}

export function useUpdateSchedule() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      scheduleId,
      updates,
    }: {
      scheduleId: string;
      updates: Partial<Schedule>;
    }) => {
      const { data, error } = await supabase
        .from("schedules")
        .update(updates)
        .eq("id", scheduleId)
        .select(`
          *,
          place:places(*)
        `)
        .single();

      if (error) throw error;
      return data as ScheduleWithPlace;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [SCHEDULES_QUERY_KEY, data.trip_id]
      });
    },
  });
}

export function useDeleteSchedule() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ scheduleId, tripId }: { scheduleId: string; tripId: string }) => {
      const { error } = await supabase
        .from("schedules")
        .delete()
        .eq("id", scheduleId);

      if (error) throw error;
      return { tripId };
    },
    onSuccess: ({ tripId }) => {
      queryClient.invalidateQueries({
        queryKey: [SCHEDULES_QUERY_KEY, tripId]
      });
    },
  });
}

export function useReorderSchedules() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tripId,
      schedules,
    }: {
      tripId: string;
      schedules: { id: string; order_index: number }[];
    }) => {
      // Update order_index for each schedule
      const updates = schedules.map(({ id, order_index }) =>
        supabase
          .from("schedules")
          .update({ order_index })
          .eq("id", id)
      );

      await Promise.all(updates);
      return { tripId };
    },
    onSuccess: ({ tripId }) => {
      queryClient.invalidateQueries({
        queryKey: [SCHEDULES_QUERY_KEY, tripId]
      });
    },
  });
}
