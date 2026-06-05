"use client";

import { useTranslations } from "next-intl";
import { Contact } from "@/types";
import { Phone, MapPin, Clock } from "lucide-react";

interface Props {
  contact: Contact;
}

export default function ContactCard({ contact }: Props) {
  const t = useTranslations("directory");

  return (
    <div className="bg-white rounded-xl border border-stone-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900 text-sm leading-snug">{contact.name}</h3>
          {contact.address && (
            <p className="flex items-center gap-1 text-xs text-stone-400 mt-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {contact.address}
            </p>
          )}
          {contact.hours && (
            <p className="flex items-center gap-1 text-xs text-stone-400 mt-0.5">
              <Clock className="h-3 w-3 shrink-0" />
              {contact.hours}
            </p>
          )}
        </div>
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-full shrink-0 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            {t("call")}
          </a>
        )}
      </div>
    </div>
  );
}
