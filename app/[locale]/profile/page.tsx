"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Camera, Phone, Bell, BellOff, LogOut } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

interface Profile {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  wa_opt_in: boolean;
  profile_photo_url: string | null;
  digital_id: number | null;
}

export default function ProfilePage() {
  const t = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "hi";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => {
        if (r.status === 401) { router.push(`/${locale}/login`); return null; }
        if (!r.ok) throw new Error(`Profile fetch failed: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setProfile(data);
        setName(data.name ?? "");
      })
      .catch((err) => console.error(err));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveName() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { toast.error(data.error); return; }
    setProfile((p) => p ? { ...p, name: data.name } : p);
    toast.success(locale === "hi" ? "नाम सहेजा गया" : "Name saved");
  }

  async function toggleOptIn() {
    const newVal = !profile?.wa_opt_in;
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wa_opt_in: newVal }),
    });
    if (res.ok) {
      setProfile((p) => p ? { ...p, wa_opt_in: newVal } : p);
      toast.success(newVal
        ? (locale === "hi" ? "WhatsApp सूचनाएं चालू" : "WhatsApp notifications on")
        : (locale === "hi" ? "WhatsApp सूचनाएं बंद" : "WhatsApp notifications off")
      );
    }
  }

  async function uploadAvatar() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/profile/avatar", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { toast.error(data.error); return; }
    setProfile((p) => p ? { ...p, profile_photo_url: data.url } : p);
    toast.success(locale === "hi" ? "फोटो अपडेट की गई" : "Photo updated");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(`/${locale}/login`);
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-6 w-6 border-2 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const initials = (profile.name ?? profile.phone.slice(-4))
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
      <h1 className="text-2xl font-bold text-green-800 mb-6">
        {locale === "hi" ? "मेरी प्रोफ़ाइल" : "My Profile"}
      </h1>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-green-100 flex items-center justify-center border-4 border-white shadow-md">
            {profile.profile_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profile_photo_url}
                alt={profile.name ?? ""}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-green-700">{initials}</span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-1.5 shadow-md hover:bg-green-700"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={uploadAvatar}
        />
        {uploading && (
          <p className="text-xs text-stone-400 mt-2">
            {locale === "hi" ? "अपलोड हो रहा है..." : "Uploading..."}
          </p>
        )}
        {profile.role === "admin" && (
          <span className="mt-2 text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-0.5 rounded-full">
            Admin
          </span>
        )}
      </div>

      {/* Name */}
      <div className="bg-white rounded-2xl border border-stone-100 p-4 space-y-3 mb-4">
        <h2 className="font-semibold text-stone-700 text-sm">
          {locale === "hi" ? "नाम" : "Name"}
        </h2>
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={locale === "hi" ? "अपना नाम दर्ज करें" : "Enter your name"}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
          />
          <Button
            onClick={saveName}
            disabled={saving || !name.trim() || name === profile.name}
            className="bg-green-700 hover:bg-green-800 shrink-0"
          >
            {saving ? "..." : (locale === "hi" ? "सहेजें" : "Save")}
          </Button>
        </div>
      </div>

      {/* Phone + Digital ID */}
      <div className="bg-white rounded-2xl border border-stone-100 p-4 mb-4 space-y-3">
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-stone-400" />
          <div>
            <p className="text-xs text-stone-400">{locale === "hi" ? "मोबाइल नंबर" : "Phone"}</p>
            <p className="font-medium text-stone-800">{profile.phone}</p>
          </div>
        </div>
        {profile.digital_id && (
          <div className="flex items-center gap-3 pt-1 border-t border-stone-50">
            <span className="text-lg">🪪</span>
            <div>
              <p className="text-xs text-stone-400">{locale === "hi" ? "Digital ID" : "Digital ID"}</p>
              <p className="font-bold text-green-700 tracking-wider">
                JGP-{String(profile.digital_id).padStart(4, "0")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp notifications */}
      <div
        className="bg-white rounded-2xl border border-stone-100 p-4 mb-6 flex items-center justify-between cursor-pointer"
        onClick={toggleOptIn}
      >
        <div className="flex items-center gap-3">
          {profile.wa_opt_in ? (
            <Bell className="h-4 w-4 text-green-600" />
          ) : (
            <BellOff className="h-4 w-4 text-stone-400" />
          )}
          <div>
            <p className="font-medium text-stone-800 text-sm">
              {locale === "hi" ? "WhatsApp सूचनाएं" : "WhatsApp Notifications"}
            </p>
            <p className="text-xs text-stone-400">
              {profile.wa_opt_in
                ? (locale === "hi" ? "चालू है" : "Enabled")
                : (locale === "hi" ? "बंद है" : "Disabled")}
            </p>
          </div>
        </div>
        <div className={`w-11 h-6 rounded-full transition-colors ${profile.wa_opt_in ? "bg-green-500" : "bg-stone-200"}`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${profile.wa_opt_in ? "translate-x-5" : "translate-x-0"}`} />
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium"
      >
        <LogOut className="h-4 w-4" />
        {locale === "hi" ? "लॉगआउट" : "Logout"}
      </button>
    </div>
  );
}
