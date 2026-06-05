"use client";

import { useTranslations, useLocale } from "next-intl";
import { Announcement } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Share2 } from "lucide-react";
import Image from "next/image";

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-slate-100 text-slate-700",
  farming: "bg-green-100 text-green-700",
  health: "bg-red-100 text-red-700",
  school: "bg-blue-100 text-blue-700",
  government: "bg-orange-100 text-orange-700",
  emergency: "bg-red-100 text-red-700",
};

interface Props {
  announcement: Announcement;
}

export default function AnnouncementCard({ announcement }: Props) {
  const t = useTranslations();
  const locale = useLocale();

  function share() {
    const text = `*${announcement.title}*\n\n${announcement.body}\n\n${process.env.NEXT_PUBLIC_APP_URL ?? ""}/${locale}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  const date = new Date(announcement.created_at).toLocaleDateString(
    locale === "hi" ? "hi-IN" : "en-IN",
    { day: "numeric", month: "short" }
  );

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
      {announcement.image_url && (
        <div className="relative h-40 w-full">
          <Image
            src={announcement.image_url}
            alt={announcement.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[announcement.category] ?? "bg-slate-100 text-slate-700"}`}>
            {t(`categories.${announcement.category}` as Parameters<typeof t>[0])}
          </span>
          <span className="text-xs text-stone-400 shrink-0">{date}</span>
        </div>
        <h3 className="font-semibold text-stone-900 leading-snug">{announcement.title}</h3>
        <p className="text-sm text-stone-500 mt-1 line-clamp-3">{announcement.body}</p>
        <button
          onClick={share}
          className="mt-3 flex items-center gap-1.5 text-xs text-green-700 hover:text-green-900 font-medium"
        >
          <Share2 className="h-3.5 w-3.5" />
          {t("announcement.shareWhatsApp")}
        </button>
      </div>
    </div>
  );
}
