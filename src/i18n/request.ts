import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export default getRequestConfig(async () => {
  // Try to get locale from cookie first
  const cookieStore = await cookies();
  let locale = cookieStore.get("NEXT_LOCALE")?.value;

  // Fall back to Accept-Language header
  if (!locale) {
    const headersList = await headers();
    const acceptLanguage = headersList.get("accept-language");
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage.split(",")[0].split("-")[0];
      locale = preferredLocale === "ko" ? "ko" : "en";
    }
  }

  // Default to Korean
  locale = locale || "ko";

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
