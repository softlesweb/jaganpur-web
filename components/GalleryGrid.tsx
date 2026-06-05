"use client";

import { useState } from "react";
import { GalleryPhoto } from "@/types";
import { X } from "lucide-react";

interface Props {
  photos: GalleryPhoto[];
}

export default function GalleryGrid({ photos }: Props) {
  const [selected, setSelected] = useState<GalleryPhoto | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-1.5">
        {photos.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className="aspect-square overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.public_url}
              alt={p.caption ?? ""}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setSelected(null)}
          >
            <X className="h-7 w-7" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selected.public_url}
            alt={selected.caption ?? ""}
            className="max-h-[80vh] max-w-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {selected.caption && (
            <p className="mt-3 text-white/80 text-sm text-center">{selected.caption}</p>
          )}
          {selected.album_tag && (
            <p className="mt-1 text-white/50 text-xs">{selected.album_tag}</p>
          )}
        </div>
      )}
    </>
  );
}
