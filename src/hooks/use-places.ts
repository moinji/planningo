"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Place, PlaceCategory } from "@/types";

// Query keys
const placesKeys = {
  all: ["places"] as const,
  byTrip: (tripId: string) => [...placesKeys.all, tripId] as const,
  byCategory: (tripId: string, category: PlaceCategory) =>
    [...placesKeys.byTrip(tripId), category] as const,
};

// Get all places for a trip
export function usePlaces(tripId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: placesKeys.byTrip(tripId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Place[];
    },
    enabled: !!tripId,
  });
}

// Get places by category
export function usePlacesByCategory(tripId: string, category: PlaceCategory) {
  const supabase = createClient();

  return useQuery({
    queryKey: placesKeys.byCategory(tripId, category),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .eq("trip_id", tripId)
        .eq("category", category)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Place[];
    },
    enabled: !!tripId && !!category,
  });
}

// Create a new place
export function useCreatePlace() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (
      input: Omit<Place, "id" | "created_at" | "created_by">
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("places")
        .insert({
          ...input,
          photos: input.photos || [],
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Place;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: placesKeys.byTrip(data.trip_id),
      });
    },
  });
}

// Update a place
export function useUpdatePlace() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      placeId,
      tripId,
      ...updates
    }: Partial<Place> & { placeId: string; tripId: string }) => {
      const { data, error } = await supabase
        .from("places")
        .update(updates)
        .eq("id", placeId)
        .select()
        .single();

      if (error) throw error;
      return { ...data, tripId } as Place & { tripId: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: placesKeys.byTrip(data.tripId),
      });
    },
  });
}

// Delete a place
export function useDeletePlace() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ placeId, tripId }: { placeId: string; tripId: string }) => {
      const { error } = await supabase.from("places").delete().eq("id", placeId);

      if (error) throw error;
      return { placeId, tripId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: placesKeys.byTrip(data.tripId),
      });
    },
  });
}

// Category display names
export const PLACE_CATEGORY_LABELS: Record<PlaceCategory, { ko: string; en: string; emoji: string }> = {
  restaurant: { ko: "음식점", en: "Restaurant", emoji: "🍴" },
  cafe: { ko: "카페", en: "Cafe", emoji: "☕" },
  attraction: { ko: "관광지", en: "Attraction", emoji: "🏛️" },
  accommodation: { ko: "숙소", en: "Accommodation", emoji: "🏨" },
  shopping: { ko: "쇼핑", en: "Shopping", emoji: "🛍️" },
  transport: { ko: "교통", en: "Transport", emoji: "🚌" },
  other: { ko: "기타", en: "Other", emoji: "📍" },
};
