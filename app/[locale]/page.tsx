"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GraduationCap, BookOpen, School, Pencil, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentProfile {
  id: string;
  name: string | null;
  phone: string;
  digital_id: number | null;
  education_level: string | null;
  exam_target: string | null;
  school_name: string | null;
  wa_opt_in: boolean;
}

interface Stats {
  total: number;
  byExam: { exam: string; count: number }[];
}

const EDU_LABELS: Record<string, string> = {
  "10th": "हाई स्कूल (10वीं)",
  "12th": "इंटर (12वीं)",
  graduate: "स्नातक",
  post_graduate: "स्नातकोत्तर",
  diploma: "डिप्लोमा",
  other: "अन्य",
};

const EXAM_LABELS: Record<string, string> = {
  ssc: "SSC",
  upsc: "UPSC",
  railway: "Railway",
  up_police: "UP Police",
  bank: "Bank",
  tet: "TET / CTET",
  neet: "NEET",
  jee: "JEE",
  up_lekhpal: "UP Lekhpal",
  other: "अन्य",
};

const EXAM_COLORS: Record<string, string> = {
  ssc: "bg-blue-500",
  upsc: "bg-purple-500",
  railway: "bg-orange-500",
  up_police: "bg-red-500",
  bank: "bg-emerald-500",
  tet: "bg-yellow-500",
  neet: "bg-pink-500",
  jee: "bg-indigo-500",
  up_lekhpal: "bg-teal-500",
  other: "bg-stone-400",
};

export default function HomePage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) ?? "hi";

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => {
        if (r.status === 401) { router.push(`/${locale}/login`); return null; }
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => { if (data) setProfile(data); })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch("/api/admin/residents")
      .then((r) => r.ok ? r.json() : [])
      .then((residents: StudentProfile[]) => {
        if (!Array.isArray(residents)) return;
        const examCount: Record<string, number> = {};
        residents.forEach((r) => {
          if (r.exam_target) examCount[r.exam_target] = (examCount[r.exam_target] ?? 0) + 1;
        });
        const byExam = Object.entries(examCount)
          .map(([exam, count]) => ({ exam, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);
        setStats({ total: residents.length, byExam });
      })
      .catch(() => {});
  }, [locale, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-6 w-6 border-2 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const digitalId = profile?.digital_id
    ? `JGP-${String(profile.digital_id).padStart(4, "0")}`
    : null;

  const isProfileComplete = profile?.education_level && profile?.exam_target;
  const initials = (profile?.name ?? profile?.phone?.slice(-4) ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-lg mx-auto">
      {/* Green hero strip */}
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 px-5 pt-6 pb-16 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 rounded-full bg-white/5 -translate-x-1/2 translate-y-1/2" />

        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-black text-white shadow-lg shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-green-200 text-xs font-medium">नमस्ते 👋</p>
            <h1 className="text-xl font-black text-white leading-tight">
              {profile?.name ?? "छात्र"}
            </h1>
            {digitalId && (
              <span className="text-xs text-green-300 font-mono">{digitalId}</span>
            )}
          </div>
        </div>
      </div>

      {/* Content area overlapping the hero */}
      <div className="px-4 -mt-10 pb-8 space-y-4">

        {/* Incomplete profile nudge */}
        {!isProfileComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-amber-800">प्रोफ़ाइल अधूरी है</p>
              <p className="text-xs text-amber-600 mt-0.5">शिक्षा और परीक्षा की जानकारी भरें</p>
            </div>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 h-8 text-xs"
              onClick={() => router.push(`/${locale}/profile`)}
            >
              भरें →
            </Button>
          </div>
        )}

        {/* Student card */}
        <div className="bg-white rounded-3xl shadow-md border border-stone-100 overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h2 className="font-bold text-stone-800">मेरी जानकारी</h2>
            <button
              onClick={() => router.push(`/${locale}/profile`)}
              className="w-8 h-8 rounded-xl bg-stone-50 hover:bg-green-50 flex items-center justify-center text-stone-400 hover:text-green-600 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="px-5 pb-5 space-y-0 divide-y divide-stone-50">
            <div className="flex items-center gap-3 py-3">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <GraduationCap className="h-4 w-4 text-green-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wide">शिक्षा</p>
                <p className="text-sm font-semibold text-stone-800 truncate">
                  {profile?.education_level ? EDU_LABELS[profile.education_level] ?? profile.education_level : <span className="text-stone-300 font-normal">—</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <BookOpen className="h-4 w-4 text-blue-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wide">तैयारी</p>
                <p className="text-sm font-semibold text-stone-800 truncate">
                  {profile?.exam_target ? EXAM_LABELS[profile.exam_target] ?? profile.exam_target : <span className="text-stone-300 font-normal">—</span>}
                </p>
              </div>
            </div>

            {profile?.school_name && (
              <div className="flex items-center gap-3 py-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <School className="h-4 w-4 text-purple-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wide">संस्था</p>
                  <p className="text-sm font-semibold text-stone-800 truncate">{profile.school_name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Community stats */}
        {stats && (
          <div className="bg-white rounded-3xl shadow-md border border-stone-100 p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-green-700" />
              </div>
              <div>
                <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wide">गाँव के छात्र</p>
                <p className="text-xl font-black text-green-700 leading-tight">{stats.total}</p>
              </div>
            </div>

            {stats.byExam.length > 0 && (
              <div className="space-y-3">
                {stats.byExam.map(({ exam, count }) => {
                  const pct = Math.round((count / stats.total) * 100);
                  const color = EXAM_COLORS[exam] ?? "bg-stone-400";
                  return (
                    <div key={exam}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-stone-600">{EXAM_LABELS[exam] ?? exam}</span>
                        <span className="text-xs font-bold text-stone-700">{count}</span>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${color} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
