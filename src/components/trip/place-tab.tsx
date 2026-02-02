"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  MapPin,
  Phone,
  Globe,
  Trash2,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button, Card, Badge } from "@/components/ui";
import { EmptyState } from "@/components/common";
import { usePlaces, useDeletePlace, PLACE_CATEGORY_LABELS } from "@/hooks/use-places";
import { AddPlaceModal } from "./add-place-modal";
import type { Trip, Place, PlaceCategory } from "@/types";

interface PlaceTabProps {
  trip: Trip;
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

export function PlaceTab({ trip }: PlaceTabProps) {
  const t = useTranslations();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | "all">("all");

  const { data: places, isLoading } = usePlaces(trip.id);

  const filteredPlaces =
    selectedCategory === "all"
      ? places
      : places?.filter((p) => p.category === selectedCategory);

  const placeCounts = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = places?.filter((p) => p.category === cat).length || 0;
      return acc;
    },
    {} as Record<PlaceCategory, number>
  );

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategory === "all"
              ? "bg-primary text-white"
              : "bg-surface text-text-secondary hover:bg-surface-hover"
          }`}
        >
          전체 ({places?.length || 0})
        </button>
        {CATEGORIES.map((category) => {
          const label = PLACE_CATEGORY_LABELS[category];
          const count = placeCounts[category];
          if (count === 0) return null;

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary hover:bg-surface-hover"
              }`}
            >
              <span>{label.emoji}</span>
              <span>{label.ko}</span>
              <span>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Place List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredPlaces && filteredPlaces.length > 0 ? (
        <div className="space-y-3">
          {filteredPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} tripId={trip.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<MapPin className="w-12 h-12" />}
          title={t("place.noPlaces")}
          description="가고 싶은 장소를 저장해보세요!"
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
        {t("place.addPlace")}
      </Button>

      {/* Add Place Modal */}
      <AddPlaceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        tripId={trip.id}
      />
    </div>
  );
}

interface PlaceCardProps {
  place: Place;
  tripId: string;
}

function PlaceCard({ place, tripId }: PlaceCardProps) {
  const deletePlace = useDeletePlace();
  const categoryLabel = PLACE_CATEGORY_LABELS[place.category];

  const handleDelete = async () => {
    if (!confirm("이 장소를 삭제하시겠습니까?")) return;

    try {
      await deletePlace.mutateAsync({ placeId: place.id, tripId });
      toast.success("장소가 삭제되었습니다.");
    } catch {
      toast.error("삭제에 실패했습니다.");
    }
  };

  const handleOpenMap = () => {
    if (place.latitude && place.longitude) {
      const url =
        place.map_provider === "kakao"
          ? `https://map.kakao.com/link/map/${encodeURIComponent(place.name)},${place.latitude},${place.longitude}`
          : `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
      window.open(url, "_blank");
    }
  };

  return (
    <Card padding="sm" className="relative">
      <div className="flex gap-3">
        {/* Category Badge */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-xl">
            {categoryLabel.emoji}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-text-primary truncate">
                {place.name}
              </h4>
              <Badge variant="default" size="sm" className="mt-1">
                {categoryLabel.ko}
              </Badge>
            </div>

            <button
              onClick={handleDelete}
              className="p-1.5 text-text-muted hover:text-error transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Address */}
          {place.address && (
            <div className="flex items-start gap-1.5 mt-2 text-sm text-text-secondary">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{place.address}</span>
            </div>
          )}

          {/* Phone & Website */}
          <div className="flex items-center gap-3 mt-2">
            {place.phone && (
              <a
                href={`tel:${place.phone}`}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                {place.phone}
              </a>
            )}
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Globe className="w-3.5 h-3.5" />
                웹사이트
              </a>
            )}
          </div>

          {/* Notes */}
          {place.notes && (
            <p className="text-sm text-text-muted mt-2 line-clamp-2">
              {place.notes}
            </p>
          )}

          {/* Map Link */}
          {place.latitude && place.longitude && (
            <button
              onClick={handleOpenMap}
              className="flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              지도에서 보기
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
