"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Contact } from "@/types";
import ContactCard from "@/components/ContactCard";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_ORDER = ["emergency", "health", "government", "school", "utility", "general"];

export default function DirectoryPage() {
  const t = useTranslations();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contacts")
      .then((r) => r.json())
      .then((data) => setContacts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const grouped = contacts.reduce<Record<string, Contact[]>>((acc, c) => {
    const key = c.category || "general";
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const orderedKeys = [
    ...CATEGORY_ORDER.filter((k) => grouped[k]),
    ...Object.keys(grouped).filter((k) => !CATEGORY_ORDER.includes(k)),
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-800">{t("directory.title")}</h1>
        <p className="text-sm text-stone-500">{t("directory.subtitle")}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <p className="text-center text-stone-400 py-16">{t("directory.noContacts")}</p>
      ) : (
        <div className="space-y-6">
          {orderedKeys.map((category) => (
            <div key={category}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2 px-1">
                {category}
              </h2>
              <div className="space-y-2">
                {grouped[category].map((c) => (
                  <ContactCard key={c.id} contact={c} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
