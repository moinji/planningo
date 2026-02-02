"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Clock } from "lucide-react";
import toast from "react-hot-toast";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button, Input } from "@/components/ui";
import { useCreateSchedule } from "@/hooks";

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  date: string;
}

interface ScheduleFormData {
  title: string;
  start_time?: string;
  end_time?: string;
  description?: string;
}

export function AddScheduleModal({
  isOpen,
  onClose,
  tripId,
  date,
}: AddScheduleModalProps) {
  const t = useTranslations();
  const createSchedule = useCreateSchedule();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormData>();

  const onSubmit = async (data: ScheduleFormData) => {
    try {
      await createSchedule.mutateAsync({
        trip_id: tripId,
        date,
        title: data.title,
        start_time: data.start_time || undefined,
        end_time: data.end_time || undefined,
        description: data.description || undefined,
      });

      toast.success("일정이 추가되었습니다!");
      reset();
      onClose();
    } catch (error) {
      toast.error("일정 추가에 실패했습니다.");
      console.error(error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("schedule.addSchedule")}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-4 space-y-4">
          {/* Title */}
          <Input
            label={t("schedule.scheduleTitle")}
            placeholder="카페에서 브런치"
            error={errors.title?.message}
            {...register("title", { required: "제목을 입력해주세요" })}
          />

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="time"
              label="시작 시간"
              leftIcon={<Clock className="w-5 h-5" />}
              {...register("start_time")}
            />
            <Input
              type="time"
              label="종료 시간"
              leftIcon={<Clock className="w-5 h-5" />}
              {...register("end_time")}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              {t("schedule.memo")} (선택)
            </label>
            <textarea
              className="w-full h-20 px-3 py-2 text-base text-text-primary bg-white border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-muted"
              placeholder="메모를 입력하세요"
              {...register("description")}
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
            isLoading={createSchedule.isPending}
          >
            {t("common.save")}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
