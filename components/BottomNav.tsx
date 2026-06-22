"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Home, Settings, UserCircle } from "lucide-react";

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
    ...(role === "admin" ? [{ href: `/${locale}/admin`, label: t("admin"), icon: Settings }] : []),
    { href: `/${locale}/profile`, label: tCommon("profile"), icon: UserCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="bg-white border-t border-stone-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around max-w-lg mx-auto px-4 h-16">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== `/${locale}` && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-5 py-2 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-all ${isActive ? "stroke-[2.5]" : "stroke-[1.7]"}`}
                />
                <span className={`text-[10px] font-semibold tracking-wide ${isActive ? "text-green-700" : ""}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
