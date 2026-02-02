"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button, Input } from "@/components/ui";
import { useCreatePlace, PLACE_CATEGORY_LABELS } from "@/hooks/use-places";
import type { PlaceCategory } from "@/types";

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
}

interface PlaceFormData {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  notes?: string;
}

const CATEGORIES: PlaceCategory[] = [
  "restaurant",
  "cafe",
  "attraction",
  "accommodation",
  "shopping",
  "transport",
  "other",
];

export function AddPlaceModal({
  isOpen,
  onClose,
  tripId,
}: AddPlaceModalProps) {
  const t = useTranslations();
  const createPlace = useCreatePlace();
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory>("attraction");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlaceFormData>();

  const onSubmit = async (data: PlaceFormData) => {
    try {
      await createPlace.mutateAsync({
        trip_id: tripId,
        name: data.name,
        address: data.address || null,
        category: selectedCategory,
        phone: data.phone || null,
        website: data.website || null,
        notes: data.notes || null,
        latitude: null,
        longitude: null,
        map_provider: "kakao",
        external_place_id: null,
        photos: [],
        rating: null,
      });

      toast.success("장소가 추가되었습니다!");
      reset();
      setSelectedCategory("attraction");
      onClose();
    } catch {
      toast.error("장소 추가에 실패했습니다.");
    }
  };

  const handleClose = () => {
    reset();
    setSelectedCategory("attraction");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t("place.addPlace")}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-4 space-y-4">
          {/* Name */}
          <Input
            label="장소명"
            placeholder="명동 맛집"
            leftIcon={<MapPin className="w-5 h-5" />}
            error={errors.name?.message}
            {...register("name", { required: "장소명을 입력해주세요" })}
          />

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              카테고리
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((category) => {
                const label = PLACE_CATEGORY_LABELS[category];
                const isSelected = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-surface text-text-secondary hover:bg-surface-hover"
                    }`}
                  >
                    <span className="text-lg">{label.emoji}</span>
                    <span className="text-xs">{label.ko}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Address */}
          <Input
            label="주소 (선택)"
            placeholder="서울시 중구 명동..."
            {...register("address")}
          />

          {/* Phone */}
          <Input
            label="전화번호 (선택)"
            placeholder="02-1234-5678"
            {...register("phone")}
          />

          {/* Website */}
          <Input
            label="웹사이트 (선택)"
            placeholder="https://..."
            {...register("website")}
          />

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              메모 (선택)
            </label>
            <textarea
              className="w-full h-20 px-3 py-2 text-base text-text-primary bg-white border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-muted"
              placeholder="특이사항이나 팁을 적어주세요"
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
            isLoading={createPlace.isPending}
          >
            {t("common.save")}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
