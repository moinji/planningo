"use client";

import { type ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "react-hot-toast";
import { QueryProvider } from "@/lib/react-query/provider";

interface ProvidersProps {
  children: ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#2D3436",
              color: "#fff",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "14px",
            },
            success: {
              iconTheme: {
                primary: "#00B894",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#FF6B6B",
                secondary: "#fff",
              },
            },
          }}
        />
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
