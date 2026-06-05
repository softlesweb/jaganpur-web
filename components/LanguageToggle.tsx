"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export default function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function toggle() {
    const next = locale === "hi" ? "en" : "hi";
    const newPath = pathname.replace(`/${locale}`, `/${next}`);
    router.push(newPath);
  }

  return (
    <button
      onClick={toggle}
      className="text-xs font-medium px-2.5 py-1 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
    >
      {locale === "hi" ? "EN" : "हिं"}
    </button>
  );
}
