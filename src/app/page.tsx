import Link from "next/link";
import { Plane, Users, MapPin, CheckSquare, Receipt, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";

const features = [
  {
    icon: Users,
    title: "함께 계획하기",
    description: "친구들과 실시간으로 여행 계획을 세워요",
  },
  {
    icon: MapPin,
    title: "장소 저장",
    description: "가고 싶은 곳을 지도에서 저장하고 공유해요",
  },
  {
    icon: Receipt,
    title: "지출 정산",
    description: "누가 얼마를 냈는지 자동으로 계산해요",
  },
  {
    icon: CheckSquare,
    title: "체크리스트",
    description: "준비물을 빠뜨리지 않도록 체크해요",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-surface to-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="relative max-w-lg mx-auto px-6 pt-16 pb-12 text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mb-6">
            <Plane className="w-10 h-10 text-white transform -rotate-45" />
          </div>

          <h1 className="text-3xl font-bold text-text-primary mb-3">
            PLANNINGO
          </h1>
          <p className="text-lg text-primary font-medium mb-2">
            함께 만드는 여행
          </p>
          <p className="text-text-secondary mb-8">
            친구들과 여행 계획을 세우고,<br />
            추억을 함께 만들어가세요!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" fullWidth className="sm:w-auto">
                <Sparkles className="w-5 h-5" />
                시작하기
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" fullWidth className="sm:w-auto">
                로그인
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="max-w-lg mx-auto px-6 py-12">
        <h2 className="text-xl font-semibold text-text-primary text-center mb-8">
          이런 걸 할 수 있어요
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-4 border border-border-light hover:border-primary transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-text-primary mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pring Character Section */}
      <section className="max-w-lg mx-auto px-6 py-8 text-center">
        <div className="bg-secondary-light/30 rounded-2xl p-6">
          <div className="text-4xl mb-3">🐧</div>
          <p className="text-text-primary font-medium mb-1">
            안녕! 나는 프링이야!
          </p>
          <p className="text-sm text-text-secondary">
            여행 준비가 막막할 때 내가 도와줄게!
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-lg mx-auto px-6 py-8 text-center">
        <p className="text-sm text-text-muted">
          © 2025 PLANNINGO. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
