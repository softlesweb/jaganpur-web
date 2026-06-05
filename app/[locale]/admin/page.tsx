"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Announcement, Contact, GalleryPhoto, AnnouncementCategory } from "@/types";
import { Trash2, Plus, AlertTriangle } from "lucide-react";

const CATEGORIES: AnnouncementCategory[] = ["general", "farming", "health", "school", "government", "emergency"];

type AdminTab = "announcements" | "contacts" | "gallery" | "broadcast";

export default function AdminPage() {
  const t = useTranslations("admin");
  const [tab, setTab] = useState<AdminTab>("announcements");

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold text-green-800 mb-4">{t("title")}</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {(["announcements", "contacts", "gallery", "broadcast"] as AdminTab[]).map((t_) => (
          <button
            key={t_}
            onClick={() => setTab(t_)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t_
                ? "bg-green-700 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {t(t_ as keyof ReturnType<typeof useTranslations<"admin">>)}
          </button>
        ))}
      </div>

      {tab === "announcements" && <AnnouncementsTab />}
      {tab === "contacts" && <ContactsTab />}
      {tab === "gallery" && <GalleryTab />}
      {tab === "broadcast" && <BroadcastTab />}
    </div>
  );
}

function AnnouncementsTab() {
  const t = useTranslations("admin");
  const tCat = useTranslations("categories");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<AnnouncementCategory>("general");
  const [isEmergency, setIsEmergency] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/announcements").then((r) => r.json()).then(setAnnouncements);
  }, []);

  async function post() {
    if (!title.trim() || !body.trim()) { toast.error("शीर्षक और विवरण आवश्यक है"); return; }
    setSaving(true);
    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, category, is_emergency: isEmergency }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { toast.error(data.error); return; }
    toast.success("घोषणा पोस्ट की गई");
    setTitle(""); setBody(""); setIsEmergency(false);
    setAnnouncements((prev) => [data, ...prev]);
  }

  async function remove(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    await fetch("/api/admin/announcements", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast.success("हटाया गया");
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-stone-100 p-4 space-y-3">
        <h2 className="font-semibold text-stone-800">{t("postAnnouncement")}</h2>
        <Input placeholder={t("title_field")} value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder={t("body_field")} value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{tCat(c as keyof ReturnType<typeof useTranslations<"categories">>)}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isEmergency}
            onChange={(e) => setIsEmergency(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-red-600 font-medium flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> {t("isEmergency")}
          </span>
        </label>
        <Button className="w-full bg-green-700 hover:bg-green-800" onClick={post} disabled={saving}>
          {saving ? t("saving") : t("submit")}
        </Button>
      </div>

      <Separator />

      <div className="space-y-2">
        {announcements.map((a) => (
          <div key={a.id} className="flex items-start justify-between bg-white rounded-xl border border-stone-100 p-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{a.title}</p>
              <p className="text-xs text-stone-400">{a.category} • {new Date(a.created_at).toLocaleDateString("hi-IN")}</p>
            </div>
            <button onClick={() => remove(a.id)} className="ml-2 text-red-400 hover:text-red-600 shrink-0">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactsTab() {
  const t = useTranslations("admin");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [categ, setCateg] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/contacts").then((r) => r.json()).then(setContacts);
  }, []);

  async function add() {
    if (!name.trim() || !categ.trim()) { toast.error("नाम और श्रेणी आवश्यक है"); return; }
    setSaving(true);
    const res = await fetch("/api/admin/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category: categ, phone, address, hours }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { toast.error(data.error); return; }
    toast.success("संपर्क जोड़ा गया");
    setName(""); setCateg(""); setPhone(""); setAddress(""); setHours("");
    setContacts((prev) => [...prev, data]);
  }

  async function remove(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    await fetch("/api/admin/contacts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setContacts((prev) => prev.filter((c) => c.id !== id));
    toast.success("हटाया गया");
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-stone-100 p-4 space-y-3">
        <h2 className="font-semibold text-stone-800">{t("addContact")}</h2>
        <Input placeholder={t("name_field")} value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder={t("category_field")} value={categ} onChange={(e) => setCateg(e.target.value)} />
        <Input placeholder={t("phone_field")} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
        <Input placeholder={t("address_field")} value={address} onChange={(e) => setAddress(e.target.value)} />
        <Input placeholder={t("hours_field")} value={hours} onChange={(e) => setHours(e.target.value)} />
        <Button className="w-full bg-green-700 hover:bg-green-800" onClick={add} disabled={saving}>
          <Plus className="h-4 w-4 mr-1" /> {saving ? t("saving") : t("addContact")}
        </Button>
      </div>

      <Separator />

      <div className="space-y-2">
        {contacts.map((c) => (
          <div key={c.id} className="flex items-center justify-between bg-white rounded-xl border border-stone-100 p-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{c.name}</p>
              <p className="text-xs text-stone-400">{c.category}{c.phone ? ` • ${c.phone}` : ""}</p>
            </div>
            <button onClick={() => remove(c.id)} className="ml-2 text-red-400 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryTab() {
  const t = useTranslations("admin");
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [caption, setCaption] = useState("");
  const [album, setAlbum] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/gallery").then((r) => r.json()).then(setPhotos);
  }, []);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) { toast.error("कृपया एक फोटो चुनें"); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    if (caption) fd.append("caption", caption);
    if (album) fd.append("album_tag", album);
    const res = await fetch("/api/admin/gallery", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { toast.error(data.error); return; }
    toast.success("फोटो अपलोड की गई");
    setCaption(""); setAlbum("");
    if (fileRef.current) fileRef.current.value = "";
    setPhotos((prev) => [data, ...prev]);
  }

  async function remove(photo: GalleryPhoto) {
    if (!confirm(t("confirmDelete"))) return;
    await fetch("/api/admin/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: photo.id, storage_path: photo.storage_path }),
    });
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    toast.success("हटाया गया");
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-stone-100 p-4 space-y-3">
        <h2 className="font-semibold text-stone-800">{t("uploadPhoto")}</h2>
        <input ref={fileRef} type="file" accept="image/*" className="w-full text-sm" />
        <Input placeholder={t("caption_field")} value={caption} onChange={(e) => setCaption(e.target.value)} />
        <Input placeholder={t("album_field")} value={album} onChange={(e) => setAlbum(e.target.value)} />
        <Button className="w-full bg-green-700 hover:bg-green-800" onClick={upload} disabled={uploading}>
          {uploading ? t("saving") : t("uploadPhoto")}
        </Button>
      </div>

      <Separator />

      <div className="grid grid-cols-3 gap-2">
        {photos.map((p) => (
          <div key={p.id} className="relative group aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.public_url} alt={p.caption ?? ""} className="w-full h-full object-cover rounded-lg" />
            <button
              onClick={() => remove(p)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BroadcastTab() {
  const t = useTranslations("admin");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ total: number; failed: number } | null>(null);

  async function send() {
    if (!message.trim()) { toast.error("संदेश खाली नहीं हो सकता"); return; }
    setSending(true);
    setResult(null);
    const res = await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) { toast.error(data.error); return; }
    setResult(data);
    toast.success(`${t("broadcastSuccess")} — ${data.total} लोगों को भेजा गया`);
    setMessage("");
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-stone-100 p-4 space-y-3">
        <h2 className="font-semibold text-stone-800">{t("broadcastMessage")}</h2>
        <p className="text-xs text-stone-400">
          सभी opted-in निवासियों को WhatsApp पर सीधे संदेश भेजा जाएगा।
        </p>
        <Textarea
          placeholder={t("broadcastPlaceholder")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />
        <Button
          className="w-full bg-green-700 hover:bg-green-800"
          onClick={send}
          disabled={sending || !message.trim()}
        >
          {sending ? t("broadcastSending") : `📣 ${t("broadcastSend")}`}
        </Button>
      </div>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
          ✓ {result.total - result.failed} / {result.total} संदेश सफलतापूर्वक भेजे गए
          {result.failed > 0 && <span className="text-red-600"> ({result.failed} विफल)</span>}
        </div>
      )}
    </div>
  );
}
