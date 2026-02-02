"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button, Input, Avatar } from "@/components/ui";
import { useCreateExpense, useTrip } from "@/hooks";
import { useAuthStore } from "@/stores";
import type { Trip } from "@/types";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

interface ExpenseFormData {
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

const categories = [
  { value: "food", label: "🍽️ 식비", icon: "🍽️" },
  { value: "transport", label: "🚗 교통", icon: "🚗" },
  { value: "accommodation", label: "🏨 숙박", icon: "🏨" },
  { value: "activity", label: "🎯 액티비티", icon: "🎯" },
  { value: "shopping", label: "🛍️ 쇼핑", icon: "🛍️" },
  { value: "other", label: "📦 기타", icon: "📦" },
];

export function AddExpenseModal({
  isOpen,
  onClose,
  trip,
}: AddExpenseModalProps) {
  const t = useTranslations();
  const { user } = useAuthStore();
  const createExpense = useCreateExpense();
  const { data: tripData } = useTrip(trip.id);

  const [selectedCategory, setSelectedCategory] = useState("food");
  const [selectedPayer, setSelectedPayer] = useState(user?.id || "");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      category: "food",
    },
  });

  // Initialize participants when modal opens
  useEffect(() => {
    if (isOpen && tripData?.members) {
      setSelectedParticipants(tripData.members.map((m) => m.user_id));
      if (user) {
        setSelectedPayer(user.id);
      }
    }
  }, [isOpen, tripData, user]);

  const onSubmit = async (data: ExpenseFormData) => {
    if (!user) return;

    try {
      const amount = Number(data.amount);
      const splitAmount = amount / selectedParticipants.length;

      await createExpense.mutateAsync({
        trip_id: trip.id,
        title: data.title,
        amount,
        currency: trip.currency,
        category: selectedCategory,
        paid_by: selectedPayer,
        split_type: "equal",
        date: data.date,
        notes: data.notes,
        participants: selectedParticipants.map((userId) => ({
          user_id: userId,
          amount: splitAmount,
        })),
      });

      toast.success("지출이 추가되었습니다!");
      reset();
      onClose();
    } catch (error) {
      toast.error("지출 추가에 실패했습니다.");
      console.error(error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const members = tripData?.members || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("expense.addExpense")}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-4 space-y-4">
          {/* Title & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="항목명"
              placeholder="점심 식사"
              error={errors.title?.message}
              {...register("title", { required: "항목명을 입력해주세요" })}
            />
            <Input
              type="number"
              label={`금액 (${trip.currency})`}
              placeholder="0"
              error={errors.amount?.message}
              {...register("amount", {
                required: "금액을 입력해주세요",
                valueAsNumber: true,
                min: { value: 1, message: "1 이상 입력해주세요" },
              })}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              카테고리
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.value
                      ? "bg-primary text-white"
                      : "bg-surface text-text-secondary hover:bg-surface-hover"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <Input
            type="date"
            label="날짜"
            {...register("date", { required: true })}
          />

          {/* Payer */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t("expense.paidBy")}
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {members.map((member) => {
                const profile = member.profile as { nickname: string } | null;
                const nickname = member.nickname_in_trip || profile?.nickname || "멤버";
                const isSelected = selectedPayer === member.user_id;

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedPayer(member.user_id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg min-w-[60px] transition-colors ${
                      isSelected
                        ? "bg-primary-light ring-2 ring-primary"
                        : "bg-surface hover:bg-surface-hover"
                    }`}
                  >
                    <Avatar size="sm" name={nickname} />
                    <span className="text-xs text-text-primary truncate max-w-full">
                      {nickname}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t("expense.splitWith")}
            </label>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => {
                const profile = member.profile as { nickname: string } | null;
                const nickname = member.nickname_in_trip || profile?.nickname || "멤버";
                const isSelected = selectedParticipants.includes(member.user_id);

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleParticipant(member.user_id)}
                    className={`flex items-center gap-2 py-1.5 px-3 rounded-full text-sm transition-colors ${
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-surface text-text-secondary hover:bg-surface-hover"
                    }`}
                  >
                    <Avatar size="xs" name={nickname} />
                    {nickname}
                  </button>
                );
              })}
            </div>
            {selectedParticipants.length > 0 && (
              <p className="text-xs text-text-muted mt-2">
                1인당:{" "}
                {selectedParticipants.length > 0
                  ? `약 ${Math.round(
                      (Number(
                        (document.querySelector('input[name="amount"]') as HTMLInputElement)?.value
                      ) || 0) / selectedParticipants.length
                    ).toLocaleString()}원`
                  : "-"}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              메모 (선택)
            </label>
            <textarea
              className="w-full h-16 px-3 py-2 text-base text-text-primary bg-white border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-muted"
              placeholder="메모를 입력하세요"
              {...register("notes")}
            />
          </div>
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="flex-1"
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            className="flex-1"
            isLoading={createExpense.isPending}
            disabled={selectedParticipants.length === 0}
          >
            {t("common.save")}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
