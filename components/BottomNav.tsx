"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Home, BookOpen, Image, Settings, LogOut } from "lucide-react";

interface Props {
  role: "resident" | "admin";
}

export default function BottomNav({ role }: Props) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();

  const links = [
    { href: `/${locale}`, label: t("home"), icon: Home },
    { href: `/${locale}/directory`, label: t("directory"), icon: BookOpen },
    { href: `/${locale}/gallery`, label: t("gallery"), icon: Image },
    ...(role === "admin" ? [{ href: `/${locale}/admin`, label: t("admin"), icon: Settings }] : []),
  ];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = `/${locale}/login`;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 safe-area-bottom z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 h-16">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== `/${locale}` && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                isActive ? "text-green-700" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-stone-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.8} />
          <span className="text-[10px] font-medium">{tCommon("logout")}</span>
        </button>
      </div>
    </nav>
  );
}
