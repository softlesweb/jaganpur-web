"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Announcement, Contact, GalleryPhoto, AnnouncementCategory } from "@/types";
import { Trash2, Plus, AlertTriangle, Pencil, Check, X, Users, Bell, BellOff } from "lucide-react";

const CATEGORIES: AnnouncementCategory[] = ["general", "farming", "health", "school", "government", "emergency"];

type AdminTab = "announcements" | "contacts" | "gallery" | "residents" | "broadcast";

interface Resident {
  id: string;
  phone: string;
  name: string | null;
  role: "resident" | "admin";
  wa_opt_in: boolean;
  digital_id: number | null;
  created_at: string;
}

interface Stats {
  residents: number;
  opted_in: number;
  announcements: number;
  contacts: number;
}

export default function AdminPage() {
  const t = useTranslations("admin");
  const [tab, setTab] = useState<AdminTab>("announcements");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/residents").then((r) => r.json()),
      fetch("/api/announcements").then((r) => r.json()),
      fetch("/api/contacts").then((r) => r.json()),
    ]).then(([residents, announcements, contacts]) => {
      if (Array.isArray(residents)) {
        setStats({
          residents: residents.length,
          opted_in: residents.filter((r: Resident) => r.wa_opt_in).length,
          announcements: Array.isArray(announcements) ? announcements.length : 0,
          contacts: Array.isArray(contacts) ? contacts.length : 0,
        });
      }
    });
  }, []);

  const tabs: { key: AdminTab; label: string }[] = [
    { key: "announcements", label: t("announcements") },
    { key: "contacts", label: t("contacts") },
    { key: "gallery", label: t("gallery") },
    { key: "residents", label: t("residents") },
    { key: "broadcast", label: t("broadcast") },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold text-green-800 mb-4">{t("title")}</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { label: t("totalResidents"), value: stats.residents, color: "text-green-700" },
            { label: t("optedIn"), value: stats.opted_in, color: "text-blue-600" },
            { label: t("totalAnnouncements"), value: stats.announcements, color: "text-orange-600" },
            { label: t("totalContacts"), value: stats.contacts, color: "text-purple-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-stone-100 p-3 text-center">
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className="text-[10px] text-stone-400 leading-tight mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              tab === key ? "bg-green-700 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "announcements" && <AnnouncementsTab onChanged={() => setStats(null)} />}
      {tab === "contacts" && <ContactsTab />}
      {tab === "gallery" && <GalleryTab />}
      {tab === "residents" && <ResidentsTab />}
      {tab === "broadcast" && <BroadcastTab optedIn={stats?.opted_in ?? 0} />}
    </div>
  );
}

/* ───────────────────── ANNOUNCEMENTS ───────────────────── */
function AnnouncementsTab({ onChanged }: { onChanged: () => void }) {
  const t = useTranslations("admin");
  const tCat = useTranslations("categories");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<AnnouncementCategory>("general");
  const [isEmergency, setIsEmergency] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

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
    onChanged();
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim()) return;
    const res = await fetch("/api/admin/announcements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title: editTitle, body: editBody }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); return; }
    setAnnouncements((prev) => prev.map((a) => a.id === id ? data : a));
    setEditId(null);
    toast.success("अपडेट किया गया");
  }

  async function remove(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    await fetch("/api/admin/announcements", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    onChanged();
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
          <input type="checkbox" checked={isEmergency} onChange={(e) => setIsEmergency(e.target.checked)} className="rounded" />
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
          <div key={a.id} className="bg-white rounded-xl border border-stone-100 p-3">
            {editId === a.id ? (
              <div className="space-y-2">
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="text-sm" />
                <Textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={2} className="text-sm" />
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-700 hover:bg-green-800 h-7 px-3" onClick={() => saveEdit(a.id)}>
                    <Check className="h-3 w-3 mr-1" /> सहेजें
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-3" onClick={() => setEditId(null)}>
                    <X className="h-3 w-3 mr-1" /> रद्द
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{a.title}</p>
                  <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{a.body}</p>
                  <p className="text-xs text-stone-300 mt-0.5">{a.category} • {new Date(a.created_at).toLocaleDateString("hi-IN")}</p>
                </div>
                <div className="flex gap-1 ml-2 shrink-0">
                  <button onClick={() => { setEditId(a.id); setEditTitle(a.title); setEditBody(a.body); }}
                    className="text-stone-400 hover:text-green-600 p-1">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => remove(a.id)} className="text-stone-400 hover:text-red-500 p-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────── CONTACTS ───────────────────── */
function ContactsTab() {
  const t = useTranslations("admin");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [categ, setCateg] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Contact>>({});

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

  async function saveEdit(id: string) {
    const res = await fetch("/api/admin/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editData }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); return; }
    setContacts((prev) => prev.map((c) => c.id === id ? data : c));
    setEditId(null);
    toast.success("अपडेट किया गया");
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
          <div key={c.id} className="bg-white rounded-xl border border-stone-100 p-3">
            {editId === c.id ? (
              <div className="space-y-2">
                <Input value={editData.name ?? ""} onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))} placeholder="नाम" className="text-sm" />
                <Input value={editData.category ?? ""} onChange={(e) => setEditData((d) => ({ ...d, category: e.target.value }))} placeholder="श्रेणी" className="text-sm" />
                <Input value={editData.phone ?? ""} onChange={(e) => setEditData((d) => ({ ...d, phone: e.target.value }))} placeholder="फोन" className="text-sm" />
                <Input value={editData.address ?? ""} onChange={(e) => setEditData((d) => ({ ...d, address: e.target.value }))} placeholder="पता" className="text-sm" />
                <Input value={editData.hours ?? ""} onChange={(e) => setEditData((d) => ({ ...d, hours: e.target.value }))} placeholder="समय" className="text-sm" />
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-700 hover:bg-green-800 h-7 px-3" onClick={() => saveEdit(c.id)}>
                    <Check className="h-3 w-3 mr-1" /> सहेजें
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-3" onClick={() => setEditId(null)}>
                    <X className="h-3 w-3 mr-1" /> रद्द
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-stone-400">{c.category}{c.phone ? ` • ${c.phone}` : ""}</p>
                  {c.address && <p className="text-xs text-stone-300">{c.address}</p>}
                </div>
                <div className="flex gap-1 ml-2 shrink-0">
                  <button onClick={() => { setEditId(c.id); setEditData({ name: c.name, category: c.category, phone: c.phone ?? "", address: c.address ?? "", hours: c.hours ?? "" }); }}
                    className="text-stone-400 hover:text-green-600 p-1">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => remove(c.id)} className="text-stone-400 hover:text-red-500 p-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────── GALLERY ───────────────────── */
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
            {p.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 rounded-b-lg px-1.5 py-0.5">
                <p className="text-white text-[9px] truncate">{p.caption}</p>
              </div>
            )}
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

/* ───────────────────── RESIDENTS ───────────────────── */
function ResidentsTab() {
  const t = useTranslations("admin");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/residents")
      .then((r) => r.json())
      .then((data) => { setResidents(data ?? []); setLoading(false); });
  }, []);

  async function toggleRole(r: Resident) {
    const newRole = r.role === "admin" ? "resident" : "admin";
    const res = await fetch("/api/admin/residents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, role: newRole }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); return; }
    setResidents((prev) => prev.map((x) => x.id === r.id ? data : x));
    toast.success(newRole === "admin" ? "Admin बनाया गया" : "Resident बनाया गया");
  }

  async function toggleWa(r: Resident) {
    const newVal = !r.wa_opt_in;
    const res = await fetch("/api/admin/residents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, wa_opt_in: newVal }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); return; }
    setResidents((prev) => prev.map((x) => x.id === r.id ? data : x));
  }

  const filtered = residents.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.name?.toLowerCase().includes(q) || r.phone.includes(q);
  });

  if (loading) return <div className="flex justify-center py-10"><div className="animate-spin h-5 w-5 border-2 border-green-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-stone-400" />
        <Input
          placeholder={t("searchResident")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9"
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-stone-400 text-sm py-8">{t("noResidents")}</p>
        )}
        {filtered.map((r) => {
          const initials = (r.name ?? r.phone.slice(-4)).split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
          const digitalId = r.digital_id ? `JGP-${String(r.digital_id).padStart(4, "0")}` : "—";
          return (
            <div key={r.id} className="bg-white rounded-xl border border-stone-100 p-3 flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-green-700">{initials}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-sm truncate">{r.name ?? "—"}</p>
                  {r.role === "admin" && (
                    <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded-full shrink-0">Admin</span>
                  )}
                </div>
                <p className="text-xs text-stone-400">{digitalId} • {r.phone}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* WA toggle */}
                <button
                  onClick={() => toggleWa(r)}
                  title={r.wa_opt_in ? "WA on" : "WA off"}
                  className={`p-1.5 rounded-full transition-colors ${r.wa_opt_in ? "text-green-600 bg-green-50" : "text-stone-300 bg-stone-50"}`}
                >
                  {r.wa_opt_in ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                </button>
                {/* Role toggle */}
                <button
                  onClick={() => toggleRole(r)}
                  title={r.role === "admin" ? t("makeResident") : t("makeAdmin")}
                  className="text-xs px-2 py-1 rounded-lg border border-stone-200 text-stone-500 hover:border-green-400 hover:text-green-700 transition-colors"
                >
                  {r.role === "admin" ? "↓ User" : "↑ Admin"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────── BROADCAST ───────────────────── */
function BroadcastTab({ optedIn }: { optedIn: number }) {
  const t = useTranslations("admin");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ total: number; failed: number } | null>(null);

  async function send() {
    if (!message.trim()) { toast.error("संदेश खाली नहीं हो सकता"); return; }
    if (!confirm(`${optedIn} निवासियों को WhatsApp संदेश भेजें?`)) return;
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
    toast.success(`${data.total - data.failed} लोगों को भेजा गया`);
    setMessage("");
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-stone-100 p-4 space-y-3">
        <h2 className="font-semibold text-stone-800">{t("broadcastMessage")}</h2>
        <p className="text-xs text-stone-400">
          <span className="font-semibold text-green-700">{optedIn}</span> opted-in निवासियों को WhatsApp पर भेजा जाएगा।
        </p>
        <Textarea
          placeholder={t("broadcastPlaceholder")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
        />
        <p className="text-xs text-stone-300 text-right">{message.length} अक्षर</p>
        <Button
          className="w-full bg-green-700 hover:bg-green-800"
          onClick={send}
          disabled={sending || !message.trim() || optedIn === 0}
        >
          {sending ? t("broadcastSending") : `📣 ${t("broadcastSend")} (${optedIn} लोग)`}
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
