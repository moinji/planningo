"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { Plus, Clock, MapPin, GripVertical, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Card } from "@/components/ui";
import { EmptyState } from "@/components/common";
import { useSchedulesByDate, useReorderSchedules, useDeleteSchedule } from "@/hooks";
import { AddScheduleModal } from "./add-schedule-modal";
import type { Trip, ScheduleWithPlace } from "@/types";

interface ScheduleTabProps {
  trip: Trip;
}

export function ScheduleTab({ trip }: ScheduleTabProps) {
  const t = useTranslations();
  const [selectedDate, setSelectedDate] = useState<string>(trip.start_date);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Generate array of dates for the trip duration
  const tripDates = useMemo(() => {
    const start = parseISO(trip.start_date);
    const end = parseISO(trip.end_date);
    return eachDayOfInterval({ start, end });
  }, [trip.start_date, trip.end_date]);

  const { data: schedules, isLoading } = useSchedulesByDate(trip.id, selectedDate);
  const reorderSchedules = useReorderSchedules();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && schedules) {
      const oldIndex = schedules.findIndex((s) => s.id === active.id);
      const newIndex = schedules.findIndex((s) => s.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedSchedules = arrayMove(schedules, oldIndex, newIndex);
        const schedulesWithOrder = reorderedSchedules.map((s, index) => ({
          id: s.id,
          order_index: index,
        }));

        try {
          await reorderSchedules.mutateAsync({
            tripId: trip.id,
            schedules: schedulesWithOrder,
          });
        } catch {
          toast.error("순서 변경에 실패했습니다.");
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Date Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {tripDates.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const isSelected = dateStr === selectedDate;
          const dayNum = tripDates.indexOf(date) + 1;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex flex-col items-center min-w-[60px] py-2 px-3 rounded-xl transition-colors ${
                isSelected
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary hover:bg-surface-hover"
              }`}
            >
              <span className="text-xs font-medium">Day {dayNum}</span>
              <span className="text-lg font-bold">{format(date, "d")}</span>
              <span className="text-xs">{format(date, "EEE", { locale: ko })}</span>
            </button>
          );
        })}
      </div>

      {/* Schedule List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : schedules && schedules.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={schedules.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {schedules.map((schedule, index) => (
                <SortableScheduleItem
                  key={schedule.id}
                  schedule={schedule}
                  index={index + 1}
                  tripId={trip.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <EmptyState
          title={t("schedule.noSchedule")}
          description={t("schedule.addFirst")}
        />
      )}

      {/* Add Button */}
      <Button
        fullWidth
        variant="outline"
        onClick={() => setIsAddModalOpen(true)}
        className="mt-4"
      >
        <Plus className="w-5 h-5" />
        {t("schedule.addSchedule")}
      </Button>

      {/* Add Schedule Modal */}
      <AddScheduleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        tripId={trip.id}
        date={selectedDate}
      />
    </div>
  );
}

interface SortableScheduleItemProps {
  schedule: ScheduleWithPlace;
  index: number;
  tripId: string;
}

function SortableScheduleItem({ schedule, index, tripId }: SortableScheduleItemProps) {
  const deleteSchedule = useDeleteSchedule();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: schedule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async () => {
    if (!confirm("이 일정을 삭제하시겠습니까?")) return;

    try {
      await deleteSchedule.mutateAsync({ scheduleId: schedule.id, tripId });
      toast.success("일정이 삭제되었습니다.");
    } catch {
      toast.error("삭제에 실패했습니다.");
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card padding="sm" className="flex items-start gap-3 group">
        {/* Index/Drag Handle */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <div className="w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
            {index}
          </div>
          <div
            {...attributes}
            {...listeners}
            className="p-0.5 cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="w-4 h-4 text-text-muted" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-text-primary truncate">
              {schedule.title}
            </h4>
            <button
              onClick={handleDelete}
              className="p-1 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Time */}
          {schedule.start_time && (
            <div className="flex items-center gap-1 text-sm text-text-secondary mt-1">
              <Clock className="w-4 h-4" />
              <span>
                {schedule.start_time.slice(0, 5)}
                {schedule.end_time && ` - ${schedule.end_time.slice(0, 5)}`}
              </span>
            </div>
          )}

          {/* Place */}
          {schedule.place && (
            <div className="flex items-center gap-1 text-sm text-text-secondary mt-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{schedule.place.name}</span>
            </div>
          )}

          {/* Description */}
          {schedule.description && (
            <p className="text-sm text-text-muted mt-2 line-clamp-2">
              {schedule.description}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
