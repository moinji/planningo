"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Settings,
  ChevronRight,
  Globe,
  Bell,
  Moon,
  HelpCircle,
  MessageSquare,
  Info,
  LogOut,
  Map,
} from "lucide-react";
import toast from "react-hot-toast";
import { Header, HeaderAction } from "@/components/layout";
import { Avatar, Card, Badge, Button } from "@/components/ui";
import { LoadingScreen } from "@/components/common";
import { useAuth, useTrips } from "@/hooks";

const menuItems = [
  { icon: Globe, labelKey: "profile.language", href: "/settings/language" },
  { icon: Bell, labelKey: "profile.notifications", href: "/settings/notifications" },
  { icon: Moon, labelKey: "profile.darkMode", href: "/settings/theme" },
  { icon: HelpCircle, labelKey: "profile.help", href: "/help" },
  { icon: MessageSquare, labelKey: "profile.feedback", href: "/feedback" },
  { icon: Info, labelKey: "profile.about", href: "/about" },
];

export default function ProfilePage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { data: trips } = useTrips();

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("로그아웃되었습니다.");
    } catch {
      toast.error("로그아웃에 실패했습니다.");
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  // Calculate stats
  const totalTrips = trips?.length || 0;
  const completedTrips = trips?.filter((t) => t.status === "completed").length || 0;
  const ongoingTrips = trips?.filter((t) => t.status === "ongoing").length || 0;

  return (
    <>
      <Header
        title={t("profile.title")}
        rightAction={
          <HeaderAction
            icon={<Settings className="w-5 h-5" />}
            onClick={() => router.push("/settings")}
          />
        }
      />

      <main className="px-4 py-4 pb-20">
        {/* Profile Card */}
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={user.avatar_url || undefined}
              name={user.nickname}
              size="xl"
            />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-text-primary">
                {user.nickname}
              </h2>
              <p className="text-sm text-text-secondary">{user.email}</p>
              {user.bio && (
                <p className="text-sm text-text-muted mt-1">{user.bio}</p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted" />
          </div>
        </Card>

        {/* Stats */}
        <Card className="mb-6">
          <div className="flex items-center justify-around py-2">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{totalTrips}</p>
              <p className="text-xs text-text-muted">전체 여행</p>
            </div>
            <div className="w-px h-10 bg-border-light" />
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{ongoingTrips}</p>
              <p className="text-xs text-text-muted">진행 중</p>
            </div>
            <div className="w-px h-10 bg-border-light" />
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{completedTrips}</p>
              <p className="text-xs text-text-muted">완료</p>
            </div>
          </div>
        </Card>

        {/* "프링" Character Greeting */}
        <Card className="mb-6 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl">
              🦩
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-text-primary">프링</h3>
                <Badge variant="primary" size="sm">여행 도우미</Badge>
              </div>
              <p className="text-sm text-text-secondary">
                {totalTrips === 0
                  ? "안녕하세요! 첫 여행을 시작해볼까요? 🎒"
                  : ongoingTrips > 0
                  ? `${ongoingTrips}개의 여행이 진행 중이에요! 즐거운 여행 되세요! ✈️`
                  : "다음 여행은 어디로 갈까요? 🗺️"}
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card
            padding="sm"
            className="cursor-pointer hover:bg-surface/50 transition-colors"
            onClick={() => router.push("/trips/new")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Map className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-text-primary">새 여행</p>
                <p className="text-xs text-text-muted">여행 만들기</p>
              </div>
            </div>
          </Card>
          <Card
            padding="sm"
            className="cursor-pointer hover:bg-surface/50 transition-colors"
            onClick={() => router.push("/trips/join")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium text-text-primary">참여하기</p>
                <p className="text-xs text-text-muted">코드로 참여</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Settings Menu */}
        <Card padding="none" className="mb-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.labelKey}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-surface transition-colors ${
                  index !== menuItems.length - 1 ? "border-b border-border-light" : ""
                }`}
                onClick={() => toast("준비 중인 기능이에요 🚧")}
              >
                <Icon className="w-5 h-5 text-text-secondary" />
                <span className="flex-1 text-text-primary">{t(item.labelKey)}</span>
                <ChevronRight className="w-5 h-5 text-text-muted" />
              </button>
            );
          })}
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          fullWidth
          onClick={handleSignOut}
          className="text-error border-error hover:bg-error/10"
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </Button>

        {/* Version */}
        <p className="text-center text-sm text-text-muted mt-8">
          {t("profile.version")} 0.1.0
        </p>
      </main>
    </>
  );
}
