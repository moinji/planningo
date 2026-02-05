"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Mail, Lock, Plane } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithEmail, signInWithOAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const redirectTo = searchParams.get("redirect") || "/trips";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmail(email, password);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "kakao" | "google") => {
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : "소셜 로그인에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
              <Plane className="w-8 h-8 text-white transform -rotate-45" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              {t("common.appName")}
            </h1>
            <p className="text-text-secondary mt-1">
              {t("auth.login")}
            </p>
          </div>

          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              fullWidth
              onClick={() => handleSocialLogin("kakao")}
              className="bg-[#FEE500] border-[#FEE500] text-[#191919] hover:bg-[#FDD835] hover:border-[#FDD835] hover:text-[#191919]"
            >
              {t("auth.continueWithKakao")}
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => handleSocialLogin("google")}
            >
              {t("auth.continueWithGoogle")}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-text-muted">
                {t("auth.orContinueWith")}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Email Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label={t("auth.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-5 h-5" />}
              placeholder="email@example.com"
              required
            />
            <Input
              type="password"
              label={t("auth.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-5 h-5" />}
              placeholder="••••••••"
              required
            />
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                {t("auth.forgotPassword")}
              </Link>
            </div>
            <Button type="submit" fullWidth isLoading={isLoading}>
              {t("auth.login")}
            </Button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-text-secondary mt-6">
            {t("auth.dontHaveAccount")}{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              {t("auth.signup")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
