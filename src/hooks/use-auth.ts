"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores";
import type { Profile } from "@/types";

export function useAuth() {
  const router = useRouter();
  const supabase = createClient();
  const { user, isLoading, isAuthenticated, setUser, setLoading, logout: storeLogout } = useAuthStore();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUser(profile as Profile);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            setUser(profile as Profile);
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setUser, setLoading]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },
    [supabase]
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, nickname: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname,
          },
        },
      });

      if (error) throw error;

      // Create profile after signup
      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          email,
          nickname,
          preferred_language: "ko",
          notification_enabled: true,
        });
      }

      return data;
    },
    [supabase]
  );

  const signInWithOAuth = useCallback(
    async (provider: "kakao" | "google") => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return data;
    },
    [supabase]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    storeLogout();
    router.push("/");
  }, [supabase, storeLogout, router]);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      setUser({ ...user, ...data } as Profile);
      return data;
    },
    [supabase, user, setUser]
  );

  return {
    user,
    isLoading,
    isAuthenticated,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    logout,
    updateProfile,
  };
}
