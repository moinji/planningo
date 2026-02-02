"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Check, Trash2, ChevronDown, ChevronRight, Users, User } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Card, Badge } from "@/components/ui";
import { EmptyState } from "@/components/common";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Input } from "@/components/ui";
import {
  useChecklists,
  useCreateChecklist,
  useCreateChecklistItem,
  useToggleChecklistItem,
  useDeleteChecklistItem,
  SUGGESTED_CHECKLIST_ITEMS,
} from "@/hooks";
import type { Trip, ChecklistWithItems } from "@/types";

interface ChecklistTabProps {
  trip: Trip;
}

export function ChecklistTab({ trip }: ChecklistTabProps) {
  const t = useTranslations();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

  const { data: checklists, isLoading } = useChecklists(trip.id);

  const completedCount =
    checklists?.reduce(
      (acc, cl) => acc + cl.items.filter((item) => item.is_completed).length,
      0
    ) || 0;
  const totalCount =
    checklists?.reduce((acc, cl) => acc + cl.items.length, 0) || 0;

  return (
    <div className="space-y-4">
      {/* Progress Summary */}
      {totalCount > 0 && (
        <Card className="bg-gradient-to-br from-primary-light/30 to-secondary-light/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">준비 현황</p>
              <p className="text-2xl font-bold text-text-primary">
                {completedCount} / {totalCount}
              </p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-surface"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={`${(completedCount / totalCount) * 176} 176`}
                  className="text-primary"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">
                {Math.round((completedCount / totalCount) * 100)}%
              </span>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : checklists && checklists.length > 0 ? (
        <div className="space-y-4">
          {checklists.map((checklist) => (
            <ChecklistCard
              key={checklist.id}
              checklist={checklist}
              tripId={trip.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={t("checklist.noChecklist")}
          description="준비물 체크리스트를 만들어보세요!"
        />
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          fullWidth
          variant="outline"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-5 h-5" />
          {t("checklist.addChecklist")}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setIsSuggestModalOpen(true)}
          className="shrink-0"
        >
          ✨ 추천
        </Button>
      </div>

      {/* Add Checklist Modal */}
      <AddChecklistModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        tripId={trip.id}
      />

      {/* Suggested Items Modal */}
      <SuggestedItemsModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        tripId={trip.id}
      />
    </div>
  );
}

interface ChecklistCardProps {
  checklist: ChecklistWithItems;
  tripId: string;
}

function ChecklistCard({ checklist, tripId }: ChecklistCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newItemText, setNewItemText] = useState("");
  const createItem = useCreateChecklistItem();
  const toggleItem = useToggleChecklistItem();
  const deleteItem = useDeleteChecklistItem();

  const completedCount = checklist.items.filter((item) => item.is_completed).length;

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    try {
      await createItem.mutateAsync({
        checklist_id: checklist.id,
        content: newItemText.trim(),
        tripId,
      });
      setNewItemText("");
    } catch {
      toast.error("항목 추가에 실패했습니다.");
    }
  };

  const handleToggle = async (itemId: string, isCompleted: boolean) => {
    try {
      await toggleItem.mutateAsync({
        itemId,
        isCompleted: !isCompleted,
        tripId,
      });
    } catch {
      toast.error("상태 변경에 실패했습니다.");
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await deleteItem.mutateAsync({ itemId, tripId });
    } catch {
      toast.error("삭제에 실패했습니다.");
    }
  };

  return (
    <Card padding="none">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-text-muted" />
          ) : (
            <ChevronRight className="w-5 h-5 text-text-muted" />
          )}
          <h3 className="font-semibold text-text-primary">{checklist.title}</h3>
          <Badge variant={checklist.is_shared ? "secondary" : "default"} size="sm">
            {checklist.is_shared ? (
              <><Users className="w-3 h-3" /> 공유</>
            ) : (
              <><User className="w-3 h-3" /> 개인</>
            )}
          </Badge>
        </div>
        <span className="text-sm text-text-muted">
          {completedCount}/{checklist.items.length}
        </span>
      </button>

      {/* Items */}
      {isExpanded && (
        <div className="border-t border-border-light">
          {checklist.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-4 py-3 border-b border-border-light last:border-0 group"
            >
              <button
                onClick={() => handleToggle(item.id, item.is_completed)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  item.is_completed
                    ? "bg-primary border-primary"
                    : "border-border hover:border-primary"
                }`}
              >
                {item.is_completed && <Check className="w-3 h-3 text-white" />}
              </button>
              <span
                className={`flex-1 ${
                  item.is_completed
                    ? "text-text-muted line-through"
                    : "text-text-primary"
                }`}
              >
                {item.content}
              </span>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add Item Input */}
          <div className="flex items-center gap-2 p-4 bg-surface/30">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
              placeholder="새 항목 추가..."
              className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAddItem}
              disabled={!newItemText.trim() || createItem.isPending}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

interface AddChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
}

function AddChecklistModal({ isOpen, onClose, tripId }: AddChecklistModalProps) {
  const t = useTranslations();
  const [title, setTitle] = useState("");
  const [isShared, setIsShared] = useState(true);
  const createChecklist = useCreateChecklist();

  const handleSubmit = async () => {
    if (!title.trim()) return;

    try {
      await createChecklist.mutateAsync({
        trip_id: tripId,
        title: title.trim(),
        is_shared: isShared,
      });
      toast.success("체크리스트가 생성되었습니다!");
      setTitle("");
      onClose();
    } catch {
      toast.error("체크리스트 생성에 실패했습니다.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("checklist.addChecklist")}>
      <div className="p-4 space-y-4">
        <Input
          label="체크리스트 이름"
          placeholder="짐 싸기"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            공유 설정
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsShared(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
                isShared
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary"
              }`}
            >
              <Users className="w-4 h-4" />
              {t("checklist.shared")}
            </button>
            <button
              type="button"
              onClick={() => setIsShared(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
                !isShared
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary"
              }`}
            >
              <User className="w-4 h-4" />
              {t("checklist.personal")}
            </button>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} className="flex-1">
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1"
          isLoading={createChecklist.isPending}
          disabled={!title.trim()}
        >
          {t("common.save")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface SuggestedItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
}

function SuggestedItemsModal({
  isOpen,
  onClose,
  tripId,
}: SuggestedItemsModalProps) {
  const suggestions = SUGGESTED_CHECKLIST_ITEMS.ko;
  const createChecklist = useCreateChecklist();
  const createItem = useCreateChecklistItem();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCategory = async (category: { category: string; items: string[] }) => {
    setIsLoading(true);
    try {
      // Create checklist
      const checklist = await createChecklist.mutateAsync({
        trip_id: tripId,
        title: category.category,
        is_shared: true,
      });

      // Add items
      for (const item of category.items) {
        await createItem.mutateAsync({
          checklist_id: checklist.id,
          content: item,
          tripId,
        });
      }

      toast.success(`"${category.category}" 체크리스트가 추가되었습니다!`);
      onClose();
    } catch {
      toast.error("추가에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="추천 체크리스트" size="lg">
      <div className="p-4 space-y-3">
        {suggestions.map((category) => (
          <button
            key={category.category}
            onClick={() => handleAddCategory(category)}
            disabled={isLoading}
            className="w-full text-left p-4 rounded-xl bg-surface hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            <h4 className="font-semibold text-text-primary mb-2">
              {category.category}
            </h4>
            <p className="text-sm text-text-muted line-clamp-2">
              {category.items.join(", ")}
            </p>
          </button>
        ))}
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} fullWidth>
          닫기
        </Button>
      </ModalFooter>
    </Modal>
  );
}
