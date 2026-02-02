"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores";
import type { Checklist, ChecklistItem, ChecklistWithItems } from "@/types";

const CHECKLISTS_QUERY_KEY = "checklists";

export function useChecklists(tripId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: [CHECKLISTS_QUERY_KEY, tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklists")
        .select(`
          *,
          items:checklist_items(*)
        `)
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Sort items by order_index
      return (data as ChecklistWithItems[]).map((checklist) => ({
        ...checklist,
        items: checklist.items.sort((a, b) => a.order_index - b.order_index),
      }));
    },
    enabled: !!tripId,
  });
}

interface CreateChecklistInput {
  trip_id: string;
  title: string;
  is_shared?: boolean;
}

export function useCreateChecklist() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (input: CreateChecklistInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("checklists")
        .insert({
          ...input,
          is_shared: input.is_shared ?? true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Checklist;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [CHECKLISTS_QUERY_KEY, data.trip_id]
      });
    },
  });
}

export function useUpdateChecklist() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      checklistId,
      updates,
    }: {
      checklistId: string;
      updates: Partial<Checklist>;
    }) => {
      const { data, error } = await supabase
        .from("checklists")
        .update(updates)
        .eq("id", checklistId)
        .select()
        .single();

      if (error) throw error;
      return data as Checklist;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [CHECKLISTS_QUERY_KEY, data.trip_id]
      });
    },
  });
}

export function useDeleteChecklist() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ checklistId, tripId }: { checklistId: string; tripId: string }) => {
      const { error } = await supabase
        .from("checklists")
        .delete()
        .eq("id", checklistId);

      if (error) throw error;
      return { tripId };
    },
    onSuccess: ({ tripId }) => {
      queryClient.invalidateQueries({
        queryKey: [CHECKLISTS_QUERY_KEY, tripId]
      });
    },
  });
}

// Checklist Items

interface CreateChecklistItemInput {
  checklist_id: string;
  content: string;
  assigned_to?: string;
  due_date?: string;
}

export function useCreateChecklistItem() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateChecklistItemInput & { tripId: string }) => {
      const { tripId, ...itemData } = input;

      // Get current max order_index
      const { data: existing } = await supabase
        .from("checklist_items")
        .select("order_index")
        .eq("checklist_id", input.checklist_id)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrderIndex = existing && existing.length > 0
        ? (existing[0].order_index || 0) + 1
        : 0;

      const { data, error } = await supabase
        .from("checklist_items")
        .insert({
          ...itemData,
          order_index: nextOrderIndex,
        })
        .select()
        .single();

      if (error) throw error;
      return { item: data as ChecklistItem, tripId };
    },
    onSuccess: ({ tripId }) => {
      queryClient.invalidateQueries({
        queryKey: [CHECKLISTS_QUERY_KEY, tripId]
      });
    },
  });
}

export function useUpdateChecklistItem() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      updates,
      tripId,
    }: {
      itemId: string;
      updates: Partial<ChecklistItem>;
      tripId: string;
    }) => {
      const { data, error } = await supabase
        .from("checklist_items")
        .update(updates)
        .eq("id", itemId)
        .select()
        .single();

      if (error) throw error;
      return { item: data as ChecklistItem, tripId };
    },
    onSuccess: ({ tripId }) => {
      queryClient.invalidateQueries({
        queryKey: [CHECKLISTS_QUERY_KEY, tripId]
      });
    },
  });
}

export function useToggleChecklistItem() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      itemId,
      isCompleted,
      tripId,
    }: {
      itemId: string;
      isCompleted: boolean;
      tripId: string;
    }) => {
      const updates: Partial<ChecklistItem> = {
        is_completed: isCompleted,
        completed_by: isCompleted && user ? user.id : null,
        completed_at: isCompleted ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from("checklist_items")
        .update(updates)
        .eq("id", itemId)
        .select()
        .single();

      if (error) throw error;
      return { item: data as ChecklistItem, tripId };
    },
    onSuccess: ({ tripId }) => {
      queryClient.invalidateQueries({
        queryKey: [CHECKLISTS_QUERY_KEY, tripId]
      });
    },
  });
}

export function useDeleteChecklistItem() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, tripId }: { itemId: string; tripId: string }) => {
      const { error } = await supabase
        .from("checklist_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      return { tripId };
    },
    onSuccess: ({ tripId }) => {
      queryClient.invalidateQueries({
        queryKey: [CHECKLISTS_QUERY_KEY, tripId]
      });
    },
  });
}

// Suggested checklist items
export const SUGGESTED_CHECKLIST_ITEMS = {
  ko: [
    { category: "필수품", items: ["여권", "신분증", "항공권/기차표", "숙소 예약 확인서", "지갑/현금/카드"] },
    { category: "전자기기", items: ["핸드폰", "충전기", "보조배터리", "카메라", "이어폰"] },
    { category: "의류", items: ["속옷", "양말", "잠옷", "외투", "편한 신발"] },
    { category: "세면도구", items: ["칫솔/치약", "샴푸/린스", "세안제", "수건", "화장품"] },
    { category: "건강/안전", items: ["상비약", "선크림", "마스크", "손소독제", "비상연락처"] },
    { category: "기타", items: ["우산/우비", "간식", "책/태블릿", "여행가이드북", "필기도구"] },
  ],
  en: [
    { category: "Essentials", items: ["Passport", "ID", "Tickets", "Booking confirmation", "Wallet/Cash/Cards"] },
    { category: "Electronics", items: ["Phone", "Charger", "Power bank", "Camera", "Earphones"] },
    { category: "Clothing", items: ["Underwear", "Socks", "Pajamas", "Jacket", "Comfortable shoes"] },
    { category: "Toiletries", items: ["Toothbrush/Toothpaste", "Shampoo/Conditioner", "Face wash", "Towel", "Cosmetics"] },
    { category: "Health/Safety", items: ["Medicine", "Sunscreen", "Masks", "Hand sanitizer", "Emergency contacts"] },
    { category: "Miscellaneous", items: ["Umbrella", "Snacks", "Book/Tablet", "Travel guide", "Pen/Notebook"] },
  ],
};
