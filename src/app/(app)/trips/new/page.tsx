"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, MapPin, Plane, Globe } from "lucide-react";
import toast from "react-hot-toast";
import { Header } from "@/components/layout";
import { Button, Input, Card } from "@/components/ui";
import { useCreateTrip } from "@/hooks";
import { createTripSchema, type CreateTripInput } from "@/lib/validations/trip";

export default function NewTripPage() {
  const t = useTranslations();
  const router = useRouter();
  const createTrip = useCreateTrip();
  const [isDomestic, setIsDomestic] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateTripInput>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      is_domestic: true,
      currency: "KRW",
    },
  });

  const onSubmit = async (data: CreateTripInput) => {
    try {
      const trip = await createTrip.mutateAsync(data);
      toast.success("여행이 생성되었습니다!");
      router.push(`/trips/${trip.id}`);
    } catch (error) {
      toast.error("여행 생성에 실패했습니다.");
      console.error(error);
    }
  };

  const handleDomesticToggle = (domestic: boolean) => {
    setIsDomestic(domestic);
    setValue("is_domestic", domestic);
    setValue("currency", domestic ? "KRW" : "USD");
  };

  return (
    <>
      <Header title={t("trip.createTrip")} showBack />

      <main className="px-4 py-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Domestic/International Toggle */}
          <Card>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDomesticToggle(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                  isDomestic
                    ? "bg-primary text-white"
                    : "bg-surface text-text-secondary"
                }`}
              >
                <Plane className="w-5 h-5" />
                <span className="font-medium">{t("trip.domestic")}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDomesticToggle(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                  !isDomestic
                    ? "bg-primary text-white"
                    : "bg-surface text-text-secondary"
                }`}
              >
                <Globe className="w-5 h-5" />
                <span className="font-medium">{t("trip.international")}</span>
              </button>
            </div>
          </Card>

          {/* Trip Info */}
          <Card>
            <div className="space-y-4">
              <Input
                label={t("trip.tripTitle")}
                placeholder="제주도 여행"
                error={errors.title?.message}
                {...register("title")}
              />

              <Input
                label={t("trip.destination")}
                placeholder={isDomestic ? "제주도" : "Tokyo, Japan"}
                leftIcon={<MapPin className="w-5 h-5" />}
                error={errors.destination?.message}
                {...register("destination")}
              />
            </div>
          </Card>

          {/* Dates */}
          <Card>
            <div className="space-y-4">
              <Input
                type="date"
                label={t("trip.startDate")}
                leftIcon={<CalendarDays className="w-5 h-5" />}
                error={errors.start_date?.message}
                {...register("start_date")}
              />

              <Input
                type="date"
                label={t("trip.endDate")}
                leftIcon={<CalendarDays className="w-5 h-5" />}
                error={errors.end_date?.message}
                {...register("end_date")}
              />
            </div>
          </Card>

          {/* Description */}
          <Card>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              {t("trip.description")} (선택)
            </label>
            <textarea
              className="w-full h-24 px-3 py-2 text-base text-text-primary bg-white border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-muted"
              placeholder="여행에 대한 간단한 설명을 작성해주세요"
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-error">
                {errors.description.message}
              </p>
            )}
          </Card>

          {/* Budget */}
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="number"
                  label={`${t("trip.budget")} (${watch("currency")})`}
                  placeholder="0"
                  error={errors.budget_total?.message}
                  {...register("budget_total", { valueAsNumber: true })}
                />
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isSubmitting || createTrip.isPending}
          >
            여행 만들기
          </Button>
        </form>

        {/* Pring Helper */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-light/30 rounded-full">
            <span className="text-2xl">🐧</span>
            <span className="text-sm text-text-secondary">
              여행을 만들면 친구들을 초대할 수 있어요!
            </span>
          </div>
        </div>
      </main>
    </>
  );
}
