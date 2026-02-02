"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import {
  ChevronRight,
  Users,
  Trash2,
  LogOut,
  Crown,
  Shield,
  User as UserIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { Header } from "@/components/layout";
import { Button, Input, Card, Avatar, Badge } from "@/components/ui";
import { LoadingScreen, EmptyState } from "@/components/common";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { useTrip, useUpdateTrip, useDeleteTrip, useLeaveTrip, useAuth } from "@/hooks";
import type { Profile } from "@/types";

interface SettingsPageProps {
  params: Promise<{ id: string }>;
}

interface TripFormData {
  title: string;
  destination: string;
  description?: string;
}

export default function TripSettingsPage({ params }: SettingsPageProps) {
  const { id } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  const { data: trip, isLoading, error } = useTrip(id);
  const updateTrip = useUpdateTrip();
  const deleteTrip = useDeleteTrip();
  const leaveTrip = useLeaveTrip();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<TripFormData>({
    values: trip
      ? {
          title: trip.title,
          destination: trip.destination,
          description: trip.description || "",
        }
      : undefined,
  });

  const isOwner = user?.id === trip?.created_by;

  const onSubmit = async (data: TripFormData) => {
    try {
      await updateTrip.mutateAsync({
        tripId: id,
        updates: {
          title: data.title,
          destination: data.destination,
          description: data.description || null,
        },
      });
      toast.success("여행 정보가 수정되었습니다.");
    } catch {
      toast.error("수정에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTrip.mutateAsync(id);
      toast.success("여행이 삭제되었습니다.");
      router.push("/trips");
    } catch {
      toast.error("삭제에 실패했습니다.");
    }
  };

  const handleLeave = async () => {
    try {
      await leaveTrip.mutateAsync(id);
      toast.success("여행에서 나갔습니다.");
      router.push("/trips");
    } catch {
      toast.error("나가기에 실패했습니다.");
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !trip) {
    return (
      <>
        <Header title="오류" showBack />
        <main className="px-4 py-4">
          <EmptyState
            title="여행을 찾을 수 없습니다"
            description="삭제되었거나 접근 권한이 없는 여행입니다."
            action={{
              label: "여행 목록으로",
              onClick: () => router.push("/trips"),
            }}
          />
        </main>
      </>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-warning" />;
      case "admin":
        return <Shield className="w-4 h-4 text-primary" />;
      default:
        return <UserIcon className="w-4 h-4 text-text-muted" />;
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      owner: "방장",
      admin: "관리자",
      member: "멤버",
    };
    return labels[role] || "멤버";
  };

  return (
    <>
      <Header title={t("trip.settings")} showBack />

      <main className="px-4 py-4 space-y-6">
        {/* Trip Info Form */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">
            여행 정보
          </h2>
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="여행 제목"
                error={errors.title?.message}
                {...register("title", { required: "제목을 입력해주세요" })}
              />
              <Input
                label="여행지"
                error={errors.destination?.message}
                {...register("destination", { required: "여행지를 입력해주세요" })}
              />
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  설명 (선택)
                </label>
                <textarea
                  className="w-full h-20 px-3 py-2 text-base text-text-primary bg-white border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-muted"
                  placeholder="여행에 대한 설명을 입력하세요"
                  {...register("description")}
                />
              </div>
              <Button
                type="submit"
                fullWidth
                disabled={!isDirty}
                isLoading={updateTrip.isPending}
              >
                저장
              </Button>
            </form>
          </Card>
        </section>

        {/* Members Section */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">
            멤버 관리
          </h2>
          <Card
            padding="none"
            className="cursor-pointer"
            onClick={() => setIsMembersModalOpen(true)}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-text-primary">
                  멤버 {trip.members?.length || 0}명
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted" />
            </div>
          </Card>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-lg font-semibold text-error mb-3">위험 구역</h2>
          <div className="space-y-3">
            {!isOwner && (
              <Card
                padding="none"
                className="cursor-pointer border-warning/50 hover:border-warning"
                onClick={() => setIsLeaveModalOpen(true)}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-warning" />
                    <span className="text-warning">여행 나가기</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-warning" />
                </div>
              </Card>
            )}

            {isOwner && (
              <Card
                padding="none"
                className="cursor-pointer border-error/50 hover:border-error"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-error" />
                    <span className="text-error">여행 삭제</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-error" />
                </div>
              </Card>
            )}
          </div>
        </section>
      </main>

      {/* Members Modal */}
      <Modal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        title="멤버 목록"
        size="lg"
      >
        <div className="p-4 space-y-3">
          {trip.members?.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg bg-surface"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  size="md"
                  name={member.nickname_in_trip || "멤버"}
                  src={(member.profile as Profile)?.avatar_url}
                />
                <div>
                  <p className="font-medium text-text-primary">
                    {member.nickname_in_trip || (member.profile as Profile)?.nickname || "멤버"}
                  </p>
                  <p className="text-sm text-text-muted">
                    {(member.profile as Profile)?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getRoleIcon(member.role)}
                <Badge
                  variant={member.role === "owner" ? "primary" : "default"}
                  size="sm"
                >
                  {getRoleLabel(member.role)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setIsMembersModalOpen(false)}
            fullWidth
          >
            닫기
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="여행 삭제"
      >
        <div className="p-4">
          <p className="text-text-primary mb-4">
            정말로 <strong>&quot;{trip.title}&quot;</strong>을(를) 삭제하시겠습니까?
          </p>
          <p className="text-sm text-text-muted">
            이 작업은 되돌릴 수 없습니다. 모든 일정, 지출, 체크리스트가 함께 삭제됩니다.
          </p>
        </div>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setIsDeleteModalOpen(false)}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleDelete}
            isLoading={deleteTrip.isPending}
            className="flex-1 !bg-error hover:!bg-error/90"
          >
            삭제
          </Button>
        </ModalFooter>
      </Modal>

      {/* Leave Confirmation Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="여행 나가기"
      >
        <div className="p-4">
          <p className="text-text-primary mb-4">
            정말로 <strong>&quot;{trip.title}&quot;</strong>에서 나가시겠습니까?
          </p>
          <p className="text-sm text-text-muted">
            나간 후에도 초대 코드로 다시 참여할 수 있습니다.
          </p>
        </div>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setIsLeaveModalOpen(false)}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleLeave}
            isLoading={leaveTrip.isPending}
            className="flex-1 !bg-warning hover:!bg-warning/90"
          >
            나가기
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
