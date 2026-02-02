"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus, Receipt, TrendingUp, Users } from "lucide-react";
import { Button, Card, Badge, Avatar } from "@/components/ui";
import { EmptyState } from "@/components/common";
import { useExpenses, calculateSettlements } from "@/hooks";
import { formatCurrency } from "@/lib/utils";
import { AddExpenseModal } from "./add-expense-modal";
import type { Trip, ExpenseWithParticipants } from "@/types";

interface ExpenseTabProps {
  trip: Trip;
}

const categoryIcons: Record<string, string> = {
  food: "🍽️",
  transport: "🚗",
  accommodation: "🏨",
  activity: "🎯",
  shopping: "🛍️",
  other: "📦",
};

export function ExpenseTab({ trip }: ExpenseTabProps) {
  const t = useTranslations();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "settlement">("list");

  const { data: expenses, isLoading } = useExpenses(trip.id);

  const { balances, settlements, totalExpense } = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return { balances: [], settlements: [], totalExpense: 0 };
    }
    return calculateSettlements(expenses);
  }, [expenses]);

  const perPerson = useMemo(() => {
    if (balances.length === 0) return 0;
    return totalExpense / balances.length;
  }, [totalExpense, balances]);

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-primary-light/30 to-secondary-light/30">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-text-secondary">{t("expense.totalExpense")}</p>
            <p className="text-2xl font-bold text-text-primary">
              {formatCurrency(totalExpense, trip.currency)}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">{t("expense.perPerson")}</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(perPerson, trip.currency)}
            </p>
          </div>
        </div>
      </Card>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === "list" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("list")}
          className="flex-1"
        >
          <Receipt className="w-4 h-4" />
          지출 내역
        </Button>
        <Button
          variant={viewMode === "settlement" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("settlement")}
          className="flex-1"
        >
          <TrendingUp className="w-4 h-4" />
          {t("expense.settlement")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : viewMode === "list" ? (
        // Expense List
        expenses && expenses.length > 0 ? (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                currency={trip.currency}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t("expense.noExpense")}
            description="첫 지출을 등록해보세요!"
          />
        )
      ) : (
        // Settlement View
        <div className="space-y-4">
          {/* Balances */}
          <Card>
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              멤버별 정산 현황
            </h3>
            <div className="space-y-2">
              {balances.map((balance) => (
                <div
                  key={balance.userId}
                  className="flex items-center justify-between py-2 border-b border-border-light last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Avatar size="sm" name={balance.nickname} />
                    <span className="text-text-primary">{balance.nickname}</span>
                  </div>
                  <span
                    className={`font-semibold ${
                      balance.balance > 0
                        ? "text-success"
                        : balance.balance < 0
                        ? "text-error"
                        : "text-text-secondary"
                    }`}
                  >
                    {balance.balance > 0 ? "+" : ""}
                    {formatCurrency(balance.balance, trip.currency)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Settlements */}
          {settlements.length > 0 && (
            <Card>
              <h3 className="font-semibold text-text-primary mb-3">
                💸 이렇게 정산하세요
              </h3>
              <div className="space-y-2">
                {settlements.map((settlement, index) => {
                  const from = balances.find((b) => b.userId === settlement.from);
                  const to = balances.find((b) => b.userId === settlement.to);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 bg-surface rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">
                          {from?.nickname}
                        </span>
                        <span className="text-text-muted">→</span>
                        <span className="font-medium text-text-primary">
                          {to?.nickname}
                        </span>
                      </div>
                      <span className="font-bold text-primary">
                        {formatCurrency(settlement.amount, trip.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Add Button */}
      <Button
        fullWidth
        variant="outline"
        onClick={() => setIsAddModalOpen(true)}
        className="mt-4"
      >
        <Plus className="w-5 h-5" />
        {t("expense.addExpense")}
      </Button>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        trip={trip}
      />
    </div>
  );
}

interface ExpenseItemProps {
  expense: ExpenseWithParticipants;
  currency: string;
}

function ExpenseItem({ expense, currency }: ExpenseItemProps) {
  const t = useTranslations();

  return (
    <Card padding="sm" className="flex items-start gap-3">
      {/* Category Icon */}
      <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-xl">
        {categoryIcons[expense.category] || categoryIcons.other}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-text-primary truncate">
            {expense.title}
          </h4>
          <span className="font-bold text-text-primary shrink-0 ml-2">
            {formatCurrency(expense.amount, currency)}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" size="sm">
            {t(`expense.category.${expense.category}`)}
          </Badge>
          <span className="text-xs text-text-muted">
            {expense.paid_by_profile &&
              `${(expense.paid_by_profile as { nickname: string }).nickname}님이 결제`}
          </span>
        </div>

        {/* Participants */}
        {expense.participants.length > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <div className="flex -space-x-1">
              {expense.participants.slice(0, 4).map((p) => (
                <Avatar
                  key={p.id}
                  size="xs"
                  name={(p.profile as { nickname: string })?.nickname || ""}
                  className="border border-white"
                />
              ))}
            </div>
            <span className="text-xs text-text-muted">
              {expense.participants.length}명이 나눔
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
