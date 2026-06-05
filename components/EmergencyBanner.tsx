"use client";

import { useTranslations } from "next-intl";
import { Announcement } from "@/types";
import { AlertTriangle } from "lucide-react";

interface Props {
  announcement: Announcement;
}

export default function EmergencyBanner({ announcement }: Props) {
  const t = useTranslations("home");

  return (
    <div className="bg-red-600 text-white rounded-2xl p-4 animate-pulse-slow">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span className="text-xs font-bold uppercase tracking-wide">{t("emergency")}</span>
      </div>
      <p className="font-semibold leading-snug">{announcement.title}</p>
      <p className="text-sm text-red-100 mt-1">{announcement.body}</p>
    </div>
  );
}
