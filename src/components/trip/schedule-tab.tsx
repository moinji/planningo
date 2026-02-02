"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { Plus, Clock, MapPin, GripVertical } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { EmptyState } from "@/components/common";
import { useSchedulesByDate } from "@/hooks";
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
        <div className="space-y-3">
          {schedules.map((schedule, index) => (
            <ScheduleItem
              key={schedule.id}
              schedule={schedule}
              index={index + 1}
            />
          ))}
        </div>
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

interface ScheduleItemProps {
  schedule: ScheduleWithPlace;
  index: number;
}

function ScheduleItem({ schedule, index }: ScheduleItemProps) {
  return (
    <Card padding="sm" className="flex items-start gap-3">
      {/* Index/Drag Handle */}
      <div className="flex flex-col items-center gap-1 pt-1">
        <div className="w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
          {index}
        </div>
        <GripVertical className="w-4 h-4 text-text-muted cursor-grab" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-text-primary truncate">
          {schedule.title}
        </h4>

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
  );
}
