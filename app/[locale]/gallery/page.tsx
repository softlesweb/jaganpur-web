"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GalleryPhoto } from "@/types";
import GalleryGrid from "@/components/GalleryGrid";
import { Skeleton } from "@/components/ui/skeleton";

export default function GalleryPage() {
  const t = useTranslations("gallery");
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => setPhotos(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-800">{t("title")}</h1>
        <p className="text-sm text-stone-500">{t("subtitle")}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <p className="text-center text-stone-400 py-16">{t("noPhotos")}</p>
      ) : (
        <GalleryGrid photos={photos} />
      )}
    </div>
  );
}
