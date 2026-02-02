"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Calendar,
  MapPin,
  Receipt,
  CheckSquare,
  Settings,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { Header, HeaderAction } from "@/components/layout";
import { Button, Card, Avatar, Badge } from "@/components/ui";
import { LoadingScreen, EmptyState } from "@/components/common";
import { ScheduleTab, ExpenseTab, ChecklistTab, PlaceTab } from "@/components/trip";
import { useTrip } from "@/hooks";
import { formatDate } from "@/lib/utils";

interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

const tabs = [
  { id: "schedule", icon: Calendar, labelKey: "schedule.title" },
  { id: "expense", icon: Receipt, labelKey: "expense.title" },
  { id: "checklist", icon: CheckSquare, labelKey: "checklist.title" },
  { id: "place", icon: MapPin, labelKey: "place.title" },
];

export default function TripDetailPage({ params }: TripDetailPageProps) {
  const { id } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const { data: trip, isLoading, error } = useTrip(id);
  const [activeTab, setActiveTab] = useState("schedule");
  const [copied, setCopied] = useState(false);

  const handleCopyInviteCode = async () => {
    if (trip?.invite_code) {
      await navigator.clipboard.writeText(trip.invite_code);
      setCopied(true);
      toast.success(t("common.copied"));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (trip) {
      const shareData = {
        title: `${trip.title} - PLANNINGO`,
        text: `${trip.title}에 함께해요! 초대 코드: ${trip.invite_code}`,
        url: `${window.location.origin}/trips/join?code=${trip.invite_code}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("링크가 복사되었습니다!");
      }
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

  const getStatusVariant = (status: string) => {
    const variants: Record<string, "primary" | "secondary" | "default"> = {
      planning: "primary",
      ongoing: "secondary",
      completed: "default",
    };
    return variants[status] || "default";
  };

  return (
    <>
      <Header
        title={trip.title}
        showBack
        rightAction={
          <HeaderAction
            icon={<Settings className="w-5 h-5" />}
            onClick={() => router.push(`/trips/${id}/settings`)}
          />
        }
      />

      <main className="pb-4">
        {/* Trip Info Header */}
        <div className="px-4 py-4 bg-gradient-to-b from-primary-light/20 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-text-primary font-medium">
                {trip.destination}
              </span>
            </div>
            <Badge variant={getStatusVariant(trip.status)}>
              {t(`trip.status.${trip.status}`)}
            </Badge>
          </div>

          <p className="text-sm text-text-secondary mb-4">
            {formatDate(trip.start_date)} ~ {formatDate(trip.end_date)}
          </p>

          {/* Members */}
          {trip.members && trip.members.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex -space-x-2">
                {trip.members.slice(0, 4).map((member) => (
                  <Avatar
                    key={member.id}
                    size="sm"
                    name={member.nickname_in_trip || "멤버"}
                    className="border-2 border-white"
                  />
                ))}
                {trip.members.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-xs text-text-secondary border-2 border-white">
                    +{trip.members.length - 4}
                  </div>
                )}
              </div>
              <span className="text-sm text-text-secondary">
                {trip.members.length}명 참여 중
              </span>
            </div>
          )}

          {/* Invite Code & Share */}
          <Card padding="sm" className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted mb-1">초대 코드</p>
              <p className="font-mono text-lg font-semibold text-text-primary tracking-widest">
                {trip.invite_code}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyInviteCode}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-light px-4 mt-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 border-b-2 transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-text-muted hover:text-text-secondary"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="px-4 py-4">
          {activeTab === "schedule" && <ScheduleTab trip={trip} />}

          {activeTab === "expense" && <ExpenseTab trip={trip} />}

          {activeTab === "checklist" && <ChecklistTab trip={trip} />}

          {activeTab === "place" && <PlaceTab trip={trip} />}
        </div>
      </main>
    </>
  );
}
