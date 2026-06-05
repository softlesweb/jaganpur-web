"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Announcement, AnnouncementCategory } from "@/types";
import AnnouncementCard from "@/components/AnnouncementCard";
import EmergencyBanner from "@/components/EmergencyBanner";
import CategoryFilter from "@/components/CategoryFilter";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES: AnnouncementCategory[] = ["general", "farming", "health", "school", "government", "emergency"];

export default function HomePage() {
  const t = useTranslations();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = activeCategory === "all"
      ? "/api/announcements"
      : `/api/announcements?category=${activeCategory}`;

    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setAnnouncements(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const emergencies = announcements.filter((a) => a.is_emergency);
  const regular = announcements.filter((a) => !a.is_emergency);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-800">{t("home.title")}</h1>
        <p className="text-sm text-stone-500">{t("home.subtitle")}</p>
      </div>

      {emergencies.length > 0 && (
        <div className="mb-4 space-y-2">
          {emergencies.map((a) => (
            <EmergencyBanner key={a.id} announcement={a} />
          ))}
        </div>
      )}

      <CategoryFilter
        categories={CATEGORIES}
        active={activeCategory}
        onChange={setActiveCategory}
      />

      <div className="mt-4 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))
        ) : regular.length === 0 ? (
          <p className="text-center text-stone-400 py-16">{t("home.noAnnouncements")}</p>
        ) : (
          regular.map((a) => <AnnouncementCard key={a.id} announcement={a} />)
        )}
      </div>
    </div>
  );
}
