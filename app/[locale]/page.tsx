"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GraduationCap, BookOpen, School, Pencil } from "lucide-react";
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
      .then((data) => {
        if (!data) return;
        setProfile(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch("/api/admin/residents")
      .then((r) => r.ok ? r.json() : [])
      .then((residents: StudentProfile[]) => {
        if (!Array.isArray(residents)) return;
        const examCount: Record<string, number> = {};
        residents.forEach((r) => {
          if (r.exam_target) {
            examCount[r.exam_target] = (examCount[r.exam_target] ?? 0) + 1;
          }
        });
        const byExam = Object.entries(examCount)
          .map(([exam, count]) => ({ exam, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
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

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-8 space-y-5">

      {/* Welcome */}
      <div>
        <p className="text-sm text-stone-500">नमस्ते 👋</p>
        <h1 className="text-2xl font-bold text-green-800">
          {profile?.name ?? "छात्र"}
        </h1>
        {digitalId && (
          <p className="text-xs text-stone-400 mt-0.5 font-mono">{digitalId}</p>
        )}
      </div>

      {/* Incomplete profile nudge */}
      {!isProfileComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-amber-800">प्रोफ़ाइल अधूरी है</p>
            <p className="text-xs text-amber-600 mt-0.5">अपनी शिक्षा और परीक्षा की जानकारी भरें</p>
          </div>
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 h-8"
            onClick={() => router.push(`/${locale}/profile`)}
          >
            भरें →
          </Button>
        </div>
      )}

      {/* Student card */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-800 text-sm">मेरी जानकारी</h2>
          <button
            onClick={() => router.push(`/${locale}/profile`)}
            className="text-stone-400 hover:text-green-600 p-1"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <GraduationCap className="h-4 w-4 text-green-700" />
            </div>
            <div>
              <p className="text-xs text-stone-400">शिक्षा</p>
              <p className="text-sm font-medium text-stone-800">
                {profile?.education_level ? EDU_LABELS[profile.education_level] ?? profile.education_level : "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <p className="text-xs text-stone-400">तैयारी</p>
              <p className="text-sm font-medium text-stone-800">
                {profile?.exam_target ? EXAM_LABELS[profile.exam_target] ?? profile.exam_target : "—"}
              </p>
            </div>
          </div>

          {profile?.school_name && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <School className="h-4 w-4 text-purple-700" />
              </div>
              <div>
                <p className="text-xs text-stone-400">संस्था</p>
                <p className="text-sm font-medium text-stone-800">{profile.school_name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Community stats */}
      {stats && (
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-800 text-sm">जगनपुर के छात्र</h2>
            <span className="text-2xl font-black text-green-700">{stats.total}</span>
          </div>
          {stats.byExam.length > 0 && (
            <div className="space-y-2">
              {stats.byExam.map(({ exam, count }) => (
                <div key={exam} className="flex items-center gap-2">
                  <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.round((count / stats.total) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-stone-500 w-20 shrink-0">{EXAM_LABELS[exam] ?? exam}</span>
                  <span className="text-xs font-bold text-stone-700 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
