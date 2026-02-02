"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores";
import { generateInviteCode } from "@/lib/utils";
import type { Trip, TripMember } from "@/types";

const TRIPS_QUERY_KEY = "trips";

export function useTrips() {
  const supabase = createClient();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: [TRIPS_QUERY_KEY, user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get trips where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from("trip_members")
        .select("trip_id")
        .eq("user_id", user.id);

      if (memberError) throw memberError;

      const tripIds = memberData.map((m) => m.trip_id);

      if (tripIds.length === 0) return [];

      const { data: trips, error: tripsError } = await supabase
        .from("trips")
        .select("*")
        .in("id", tripIds)
        .order("start_date", { ascending: true });

      if (tripsError) throw tripsError;

      return trips as Trip[];
    },
    enabled: !!user,
  });
}

export function useTrip(tripId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: [TRIPS_QUERY_KEY, tripId],
    queryFn: async () => {
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .select("*")
        .eq("id", tripId)
        .single();

      if (tripError) throw tripError;

      // Get members with profiles
      const { data: members, error: membersError } = await supabase
        .from("trip_members")
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq("trip_id", tripId);

      if (membersError) throw membersError;

      return {
        ...trip,
        members,
      } as Trip & { members: (TripMember & { profile: unknown })[] };
    },
    enabled: !!tripId,
  });
}

interface CreateTripInput {
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  description?: string;
  is_domestic: boolean;
  currency: string;
  budget_total?: number | null;
}

export function useCreateTrip() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (input: CreateTripInput) => {
      if (!user) throw new Error("Not authenticated");

      const inviteCode = generateInviteCode();

      // Create the trip
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .insert({
          ...input,
          created_by: user.id,
          invite_code: inviteCode,
          status: "planning",
          currency: input.currency || "KRW",
          timezone: "Asia/Seoul",
        })
        .select()
        .single();

      if (tripError) throw tripError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from("trip_members")
        .insert({
          trip_id: trip.id,
          user_id: user.id,
          role: "owner",
          color: "#FF6B9D",
        });

      if (memberError) throw memberError;

      return trip as Trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRIPS_QUERY_KEY] });
    },
  });
}

export function useUpdateTrip() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tripId,
      updates,
    }: {
      tripId: string;
      updates: Partial<Trip>;
    }) => {
      const { data, error } = await supabase
        .from("trips")
        .update(updates)
        .eq("id", tripId)
        .select()
        .single();

      if (error) throw error;
      return data as Trip;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TRIPS_QUERY_KEY, data.id] });
      queryClient.invalidateQueries({ queryKey: [TRIPS_QUERY_KEY] });
    },
  });
}

export function useDeleteTrip() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tripId: string) => {
      const { error } = await supabase
        .from("trips")
        .delete()
        .eq("id", tripId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRIPS_QUERY_KEY] });
    },
  });
}

export function useJoinTrip() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!user) throw new Error("Not authenticated");

      // Find trip by invite code
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .select("id")
        .eq("invite_code", inviteCode)
        .single();

      if (tripError) throw new Error("Invalid invite code");

      // Check if already a member
      const { data: existing } = await supabase
        .from("trip_members")
        .select("id")
        .eq("trip_id", trip.id)
        .eq("user_id", user.id)
        .single();

      if (existing) throw new Error("Already a member of this trip");

      // Assign a random color
      const colors = ["#FF6B9D", "#4ECDC4", "#FFD93D", "#6C5CE7", "#A8E6CF", "#FF8B94"];
      const color = colors[Math.floor(Math.random() * colors.length)];

      // Add as member
      const { error: memberError } = await supabase
        .from("trip_members")
        .insert({
          trip_id: trip.id,
          user_id: user.id,
          role: "member",
          color,
        });

      if (memberError) throw memberError;

      return trip.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRIPS_QUERY_KEY] });
    },
  });
}

export function useLeaveTrip() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (tripId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("trip_members")
        .delete()
        .eq("trip_id", tripId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRIPS_QUERY_KEY] });
    },
  });
}
