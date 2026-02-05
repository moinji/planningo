"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Mail, Lock, User, Plane } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";

export default function SignupPage() {
  const t = useTranslations();
  const router = useRouter();
  const { signUpWithEmail, signInWithOAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = t("validation.required");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("validation.invalidEmail");
    }

    if (!formData.password) {
      newErrors.password = t("validation.required");
    } else if (formData.password.length < 8) {
      newErrors.password = t("validation.passwordMin");
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("validation.passwordMatch");
    }

    if (!formData.nickname) {
      newErrors.nickname = t("validation.required");
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = t("validation.nicknameMin");
    } else if (formData.nickname.length > 20) {
      newErrors.nickname = t("validation.nicknameMax");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setSubmitError(null);

    try {
      await signUpWithEmail(formData.email, formData.password, formData.nickname);
      router.push("/trips");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: "kakao" | "google") => {
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "소셜 로그인에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
              {t("auth.signup")}
            </p>
          </div>

          {/* Social Signup */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              fullWidth
              onClick={() => handleSocialSignup("kakao")}
              className="bg-[#FEE500] border-[#FEE500] text-[#191919] hover:bg-[#FDD835] hover:border-[#FDD835] hover:text-[#191919]"
            >
              {t("auth.continueWithKakao")}
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => handleSocialSignup("google")}
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
          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {submitError}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              name="email"
              label={t("auth.email")}
              value={formData.email}
              onChange={handleChange}
              leftIcon={<Mail className="w-5 h-5" />}
              placeholder="email@example.com"
              error={errors.email}
              required
            />
            <Input
              type="text"
              name="nickname"
              label={t("auth.nickname")}
              value={formData.nickname}
              onChange={handleChange}
              leftIcon={<User className="w-5 h-5" />}
              placeholder="닉네임"
              error={errors.nickname}
              required
            />
            <Input
              type="password"
              name="password"
              label={t("auth.password")}
              value={formData.password}
              onChange={handleChange}
              leftIcon={<Lock className="w-5 h-5" />}
              placeholder="••••••••"
              error={errors.password}
              required
            />
            <Input
              type="password"
              name="confirmPassword"
              label={t("auth.confirmPassword")}
              value={formData.confirmPassword}
              onChange={handleChange}
              leftIcon={<Lock className="w-5 h-5" />}
              placeholder="••••••••"
              error={errors.confirmPassword}
              required
            />

            <p className="text-xs text-text-muted text-center">
              {t("auth.termsAgreement")}
            </p>

            <Button type="submit" fullWidth isLoading={isLoading}>
              {t("auth.signup")}
            </Button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-text-secondary mt-6">
            {t("auth.alreadyHaveAccount")}{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              {t("auth.login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
