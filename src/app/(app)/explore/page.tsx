"use client";

import { useTranslations } from "next-intl";
import { Map } from "lucide-react";
import { Header } from "@/components/layout";
import { EmptyState } from "@/components/common";

export default function ExplorePage() {
  const t = useTranslations();

  return (
    <>
      <Header title={t("navigation.explore")} />
      <main className="px-4 py-4">
        <EmptyState
          icon={<Map className="w-16 h-16" />}
          title="탐색 기능 준비 중"
          description="곧 다양한 여행지와 추천 코스를 만나볼 수 있어요!"
        />
      </main>
    </>
  );
}
