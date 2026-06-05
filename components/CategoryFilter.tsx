"use client";

import { useTranslations } from "next-intl";
import { AnnouncementCategory } from "@/types";

interface Props {
  categories: AnnouncementCategory[];
  active: string;
  onChange: (cat: string) => void;
}

export default function CategoryFilter({ categories, active, onChange }: Props) {
  const t = useTranslations();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => onChange("all")}
        className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          active === "all"
            ? "bg-green-700 text-white"
            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
        }`}
      >
        {t("home.all")}
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            active === cat
              ? "bg-green-700 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          {t(`categories.${cat}` as Parameters<typeof t>[0])}
        </button>
      ))}
    </div>
  );
}
