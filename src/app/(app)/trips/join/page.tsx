"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ticket, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { Header } from "@/components/layout";
import { Button, Input, Card } from "@/components/ui";
import { useJoinTrip } from "@/hooks";
import { joinTripSchema, type JoinTripInput } from "@/lib/validations/trip";

export default function JoinTripPage() {
  const t = useTranslations();
  const router = useRouter();
  const joinTrip = useJoinTrip();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JoinTripInput>({
    resolver: zodResolver(joinTripSchema),
  });

  const onSubmit = async (data: JoinTripInput) => {
    try {
      const tripId = await joinTrip.mutateAsync(data.inviteCode);
      toast.success("여행에 참여했습니다!");
      router.push(`/trips/${tripId}`);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Invalid invite code") {
          toast.error("유효하지 않은 초대 코드입니다.");
        } else if (error.message === "Already a member of this trip") {
          toast.error("이미 참여 중인 여행입니다.");
        } else {
          toast.error("참여에 실패했습니다.");
        }
      }
      console.error(error);
    }
  };

  return (
    <>
      <Header title={t("trip.joinTrip")} showBack />

      <main className="px-4 py-4">
        <div className="max-w-md mx-auto">
          {/* Info Card */}
          <Card className="mb-6 bg-primary-light/30 border-primary-light">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-text-primary mb-1">
                  초대 코드로 참여하기
                </h2>
                <p className="text-sm text-text-secondary">
                  친구에게 받은 8자리 초대 코드를 입력하면
                  여행에 참여할 수 있어요!
                </p>
              </div>
            </div>
          </Card>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <Input
                label="초대 코드"
                placeholder="ABCD1234"
                leftIcon={<Ticket className="w-5 h-5" />}
                error={errors.inviteCode?.message}
                className="text-center text-xl tracking-widest uppercase"
                maxLength={8}
                {...register("inviteCode", {
                  onChange: (e) => {
                    e.target.value = e.target.value.toUpperCase();
                  },
                })}
              />
            </Card>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isSubmitting || joinTrip.isPending}
            >
              참여하기
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          {/* Pring Helper */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-light/30 rounded-full">
              <span className="text-2xl">🐧</span>
              <span className="text-sm text-text-secondary">
                초대 코드는 대소문자 구분 없이 입력해도 돼요!
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
