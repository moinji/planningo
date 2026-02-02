"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores";
import type { Expense, ExpenseWithParticipants, MemberBalance, Settlement } from "@/types";

const EXPENSES_QUERY_KEY = "expenses";

export function useExpenses(tripId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: [EXPENSES_QUERY_KEY, tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          participants:expense_participants(
            *,
            profile:profiles(*)
          ),
          paid_by_profile:profiles!expenses_paid_by_fkey(*)
        `)
        .eq("trip_id", tripId)
        .order("date", { ascending: false });

      if (error) throw error;
      return data as ExpenseWithParticipants[];
    },
    enabled: !!tripId,
  });
}

interface CreateExpenseInput {
  trip_id: string;
  title: string;
  amount: number;
  currency?: string;
  category: string;
  paid_by: string;
  split_type: "equal" | "custom" | "individual";
  date: string;
  place_id?: string;
  notes?: string;
  participants: { user_id: string; amount: number }[];
}

export function useCreateExpense() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (input: CreateExpenseInput) => {
      if (!user) throw new Error("Not authenticated");

      const { participants, ...expenseData } = input;

      // Create expense
      const { data: expense, error: expenseError } = await supabase
        .from("expenses")
        .insert({
          ...expenseData,
          created_by: user.id,
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Create participants
      if (participants.length > 0) {
        const participantData = participants.map((p) => ({
          expense_id: expense.id,
          user_id: p.user_id,
          amount: p.amount,
          is_settled: false,
        }));

        const { error: participantError } = await supabase
          .from("expense_participants")
          .insert(participantData);

        if (participantError) throw participantError;
      }

      return expense as Expense;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [EXPENSES_QUERY_KEY, data.trip_id]
      });
    },
  });
}

export function useUpdateExpense() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      expenseId,
      updates,
      participants,
    }: {
      expenseId: string;
      updates: Partial<Expense>;
      participants?: { user_id: string; amount: number }[];
    }) => {
      const { data, error } = await supabase
        .from("expenses")
        .update(updates)
        .eq("id", expenseId)
        .select()
        .single();

      if (error) throw error;

      // Update participants if provided
      if (participants) {
        // Delete existing participants
        await supabase
          .from("expense_participants")
          .delete()
          .eq("expense_id", expenseId);

        // Insert new participants
        if (participants.length > 0) {
          const participantData = participants.map((p) => ({
            expense_id: expenseId,
            user_id: p.user_id,
            amount: p.amount,
            is_settled: false,
          }));

          await supabase
            .from("expense_participants")
            .insert(participantData);
        }
      }

      return data as Expense;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [EXPENSES_QUERY_KEY, data.trip_id]
      });
    },
  });
}

export function useDeleteExpense() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ expenseId, tripId }: { expenseId: string; tripId: string }) => {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

      if (error) throw error;
      return { tripId };
    },
    onSuccess: ({ tripId }) => {
      queryClient.invalidateQueries({
        queryKey: [EXPENSES_QUERY_KEY, tripId]
      });
    },
  });
}

export function useMarkSettled() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      participantId,
      tripId,
    }: {
      participantId: string;
      tripId: string;
    }) => {
      const { error } = await supabase
        .from("expense_participants")
        .update({
          is_settled: true,
          settled_at: new Date().toISOString(),
        })
        .eq("id", participantId);

      if (error) throw error;
      return { tripId };
    },
    onSuccess: ({ tripId }) => {
      queryClient.invalidateQueries({
        queryKey: [EXPENSES_QUERY_KEY, tripId]
      });
    },
  });
}

// Utility function to calculate settlements
export function calculateSettlements(expenses: ExpenseWithParticipants[]): {
  balances: MemberBalance[];
  settlements: Settlement[];
  totalExpense: number;
} {
  const balanceMap = new Map<string, { paid: number; shouldPay: number; nickname: string }>();
  let totalExpense = 0;

  // Calculate what each person paid and should pay
  expenses.forEach((expense) => {
    totalExpense += expense.amount;

    // Add to paid amount
    const payer = balanceMap.get(expense.paid_by) || { paid: 0, shouldPay: 0, nickname: "" };
    payer.paid += expense.amount;
    if (expense.paid_by_profile) {
      payer.nickname = (expense.paid_by_profile as { nickname: string }).nickname;
    }
    balanceMap.set(expense.paid_by, payer);

    // Add to shouldPay amount for each participant
    expense.participants.forEach((participant) => {
      const user = balanceMap.get(participant.user_id) || { paid: 0, shouldPay: 0, nickname: "" };
      user.shouldPay += participant.amount;
      if (participant.profile) {
        user.nickname = (participant.profile as { nickname: string }).nickname;
      }
      balanceMap.set(participant.user_id, user);
    });
  });

  // Convert to array and calculate balance
  const balances: MemberBalance[] = Array.from(balanceMap.entries()).map(([userId, data]) => ({
    userId,
    nickname: data.nickname,
    paid: data.paid,
    shouldPay: data.shouldPay,
    balance: data.paid - data.shouldPay,
  }));

  // Calculate optimal settlements (simplified algorithm)
  const settlements: Settlement[] = [];
  const debtors = balances.filter((b) => b.balance < 0).map((b) => ({ ...b }));
  const creditors = balances.filter((b) => b.balance > 0).map((b) => ({ ...b }));

  // Sort by amount (largest first)
  debtors.sort((a, b) => a.balance - b.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  for (const debtor of debtors) {
    let remaining = -debtor.balance;

    for (const creditor of creditors) {
      if (remaining <= 0 || creditor.balance <= 0) break;

      const amount = Math.min(remaining, creditor.balance);
      if (amount > 0) {
        settlements.push({
          from: debtor.userId,
          to: creditor.userId,
          amount,
        });
        remaining -= amount;
        creditor.balance -= amount;
      }
    }
  }

  return { balances, settlements, totalExpense };
}
