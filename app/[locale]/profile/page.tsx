"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Phone, Bell, BellOff, LogOut, ChevronRight } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

const EDUCATION_LEVELS = [
  { value: "10th", label: "हाई स्कूल (10वीं)" },
  { value: "12th", label: "इंटर (12वीं)" },
  { value: "graduate", label: "स्नातक (ग्रेजुएट)" },
  { value: "post_graduate", label: "स्नातकोत्तर" },
  { value: "diploma", label: "डिप्लोमा" },
  { value: "other", label: "अन्य" },
];

const EXAMS = [
  { value: "ssc", label: "SSC (CGL / CHSL / MTS)" },
  { value: "upsc", label: "UPSC (IAS / IPS)" },
  { value: "railway", label: "Railway (NTPC / Group D)" },
  { value: "up_police", label: "UP Police" },
  { value: "bank", label: "Bank (PO / Clerk)" },
  { value: "tet", label: "TET / CTET (शिक्षक)" },
  { value: "neet", label: "NEET (मेडिकल)" },
  { value: "jee", label: "JEE (इंजीनियरिंग)" },
  { value: "up_lekhpal", label: "UP Lekhpal" },
  { value: "other", label: "अन्य" },
];

interface Profile {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  wa_opt_in: boolean;
  profile_photo_url: string | null;
  digital_id: number | null;
  education_level: string | null;
  exam_target: string | null;
  school_name: string | null;
}

export default function ProfilePage() {
  const t = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "hi";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [examTarget, setExamTarget] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingStudent, setSavingStudent] = useState(false);
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
        setEducationLevel(data.education_level ?? "");
        setExamTarget(data.exam_target ?? "");
        setSchoolName(data.school_name ?? "");
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
    toast.success("नाम सहेजा गया ✓");
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
      toast.success(newVal ? "WhatsApp सूचनाएं चालू ✓" : "WhatsApp सूचनाएं बंद");
    }
  }

  async function saveStudentDetails() {
    setSavingStudent(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ education_level: educationLevel || null, exam_target: examTarget || null, school_name: schoolName.trim() || null }),
    });
    const data = await res.json();
    setSavingStudent(false);
    if (!res.ok) { toast.error(data.error); return; }
    setProfile((p) => p ? { ...p, education_level: data.education_level, exam_target: data.exam_target, school_name: data.school_name } : p);
    toast.success("जानकारी सहेजी गई ✓");
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
    toast.success("फोटो अपडेट की गई ✓");
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

  const digitalId = profile.digital_id
    ? `JGP-${String(profile.digital_id).padStart(4, "0")}`
    : null;

  return (
    <div className="max-w-lg mx-auto">
      {/* Green hero with avatar */}
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 px-5 pt-6 pb-20 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5" />
        <h1 className="relative text-white font-bold text-lg mb-1">मेरी प्रोफ़ाइल</h1>
        {profile.role === "admin" && (
          <span className="relative text-xs bg-white/20 text-white font-semibold px-2.5 py-0.5 rounded-full">
            Admin
          </span>
        )}
      </div>

      {/* Avatar overlapping hero */}
      <div className="flex flex-col items-center -mt-14 mb-2 relative z-10">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-green-100 border-4 border-white shadow-xl flex items-center justify-center">
            {profile.profile_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.profile_photo_url} alt={profile.name ?? ""} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-green-700">{initials}</span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-1.5 shadow-md hover:bg-green-700 border-2 border-white"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
        {uploading && <p className="text-xs text-stone-400 mt-1">अपलोड हो रहा है...</p>}
        <p className="mt-2 text-lg font-black text-stone-800">{profile.name ?? "—"}</p>
        {digitalId && <p className="text-xs font-mono text-green-600 font-semibold">{digitalId}</p>}
      </div>

      <div className="px-4 pb-8 space-y-3">

        {/* Name */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 space-y-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">नाम बदलें</p>
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="अपना नाम दर्ज करें"
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              className="h-11 rounded-xl border-stone-200"
            />
            <Button
              onClick={saveName}
              disabled={saving || !name.trim() || name === profile.name}
              className="h-11 px-5 rounded-xl shrink-0"
            >
              {saving ? "..." : "सहेजें"}
            </Button>
          </div>
        </div>

        {/* Phone + Digital ID */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 divide-y divide-stone-50">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
              <Phone className="h-3.5 w-3.5 text-stone-500" />
            </div>
            <div>
              <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wide">मोबाइल नंबर</p>
              <p className="text-sm font-semibold text-stone-800">{profile.phone}</p>
            </div>
          </div>
          {digitalId && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-base">
                🪪
              </div>
              <div>
                <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wide">Digital ID</p>
                <p className="text-sm font-bold text-green-700 tracking-wider">{digitalId}</p>
              </div>
            </div>
          )}
        </div>

        {/* Student details */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 space-y-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">शिक्षा और परीक्षा</p>

          <div>
            <label className="text-xs text-stone-400 block mb-1.5">शिक्षा का स्तर</label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm focus:border-green-500 focus:outline-none"
            >
              <option value="">चुनें...</option>
              {EDUCATION_LEVELS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-stone-400 block mb-1.5">परीक्षा की तैयारी</label>
            <select
              value={examTarget}
              onChange={(e) => setExamTarget(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm focus:border-green-500 focus:outline-none"
            >
              <option value="">चुनें...</option>
              {EXAMS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-stone-400 block mb-1.5">स्कूल / कॉलेज</label>
            <Input
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="संस्था का नाम"
              className="h-12 rounded-xl border-stone-200"
            />
          </div>

          <Button onClick={saveStudentDetails} disabled={savingStudent} className="w-full h-11 rounded-xl font-semibold">
            {savingStudent ? "सहेजा जा रहा है..." : "जानकारी सहेजें ✓"}
          </Button>
        </div>

        {/* WhatsApp notifications toggle */}
        <div
          className="bg-white rounded-2xl shadow-sm border border-stone-100 px-4 py-3.5 flex items-center justify-between cursor-pointer active:bg-stone-50 transition-colors"
          onClick={toggleOptIn}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${profile.wa_opt_in ? "bg-green-100" : "bg-stone-100"}`}>
              {profile.wa_opt_in
                ? <Bell className="h-3.5 w-3.5 text-green-600" />
                : <BellOff className="h-3.5 w-3.5 text-stone-400" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-800">WhatsApp सूचनाएं</p>
              <p className="text-xs text-stone-400">{profile.wa_opt_in ? "चालू है" : "बंद है"}</p>
            </div>
          </div>
          <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${profile.wa_opt_in ? "bg-green-500" : "bg-stone-200"}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform duration-200 ${profile.wa_opt_in ? "translate-x-5" : "translate-x-0"}`} />
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full bg-white rounded-2xl shadow-sm border border-red-100 px-4 py-3.5 flex items-center justify-between text-red-500 hover:bg-red-50 transition-colors active:bg-red-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <LogOut className="h-3.5 w-3.5 text-red-400" />
            </div>
            <span className="text-sm font-semibold">लॉगआउट</span>
          </div>
          <ChevronRight className="h-4 w-4 text-red-300" />
        </button>
      </div>
    </div>
  );
}
