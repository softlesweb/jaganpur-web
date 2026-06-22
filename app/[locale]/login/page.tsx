"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

type Step = "phone" | "otp" | "name" | "student_details" | "success";

interface UserData {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  digital_id?: number;
}

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

const STEP_COUNT: Record<Step, number> = {
  phone: 1, otp: 2, name: 3, student_details: 4, success: 5,
};

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "hi";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [examTarget, setExamTarget] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  async function sendOtp() {
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      toast.error("कृपया सही मोबाइल नंबर दर्ज करें");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone.replace(/\D/g, "") }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error ?? "OTP भेजने में विफल"); return; }
    toast.success("OTP आपके WhatsApp पर भेजा गया ✓");
    setStep("otp");
  }

  async function verifyOtp() {
    if (!otp || otp.length !== 6) {
      toast.error("कृपया 6 अंकों का OTP दर्ज करें");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone.replace(/\D/g, ""), otp }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error ?? "OTP गलत है"); return; }

    setUserData(data.user);
    setIsNewUser(data.is_new_user);

    if (!data.user.name) {
      setStep("name");
    } else if (!data.user.education_level) {
      setStep("student_details");
    } else if (data.is_new_user) {
      setStep("success");
    } else {
      router.push(`/${locale}`);
      router.refresh();
    }
  }

  async function saveName() {
    if (!name.trim()) { toast.error("कृपया अपना नाम दर्ज करें"); return; }
    setLoading(true);
    await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setLoading(false);
    if (userData) setUserData({ ...userData, name: name.trim() });
    setStep("student_details");
  }

  async function saveStudentDetails(skip = false) {
    if (!skip && !educationLevel) {
      toast.error("कृपया शिक्षा का स्तर चुनें");
      return;
    }
    setLoading(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        education_level: skip ? null : educationLevel,
        exam_target: skip ? null : examTarget || null,
        school_name: skip ? null : schoolName.trim() || null,
      }),
    });
    setLoading(false);
    setStep("success");
  }

  function goHome() {
    router.push(`/${locale}`);
    router.refresh();
  }

  const digitalId = userData?.digital_id
    ? `JGP-${String(userData.digital_id).padStart(4, "0")}`
    : null;

  const isSuccess = step === "success";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Green hero — hidden on success */}
      {!isSuccess && (
        <div className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 pt-14 pb-12 px-6 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

          <div className="relative">
            <div className="text-6xl mb-4 drop-shadow-lg">🎓</div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              जगनपुर छात्र पोर्टल
            </h1>
            <p className="text-green-200 text-sm mt-2 leading-relaxed">
              जगनपुर के होनहार छात्रों के लिए
            </p>

            {/* Step dots */}
            {step !== "phone" && (
              <div className="flex justify-center gap-2 mt-5">
                {(["phone", "otp", "name", "student_details"] as Step[]).map((s, i) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      STEP_COUNT[step] > i + 1
                        ? "w-6 bg-white"
                        : STEP_COUNT[step] === i + 1
                        ? "w-6 bg-white"
                        : "w-3 bg-white/30"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* White sheet */}
      <div className={`flex-1 bg-white ${!isSuccess ? "rounded-t-3xl -mt-5 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]" : "bg-gradient-to-br from-green-50 to-emerald-50"} px-6 pt-8 pb-10`}>

        {/* Phone step */}
        {step === "phone" && (
          <div className="max-w-sm mx-auto space-y-5">
            <div>
              <h2 className="text-xl font-bold text-stone-800">WhatsApp से Login करें</h2>
              <p className="text-sm text-stone-500 mt-1">अपना नंबर डालें, OTP आएगा</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center px-3 bg-stone-50 rounded-xl text-stone-600 text-sm font-semibold border border-stone-200 shrink-0">
                🇮🇳 +91
              </div>
              <Input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                className="text-lg h-12 rounded-xl border-stone-200 focus:border-green-500"
                autoFocus
              />
            </div>
            <Button
              className="w-full h-12 text-base font-semibold rounded-xl shadow-sm"
              onClick={sendOtp}
              disabled={loading}
            >
              {loading ? "भेजा जा रहा है..." : "WhatsApp OTP भेजें →"}
            </Button>
            <p className="text-center text-xs text-stone-400">
              Registration निःशुल्क है • WhatsApp जरूरी है
            </p>
          </div>
        )}

        {/* OTP step */}
        {step === "otp" && (
          <div className="max-w-sm mx-auto space-y-5">
            <div>
              <h2 className="text-xl font-bold text-stone-800">OTP दर्ज करें</h2>
              <p className="text-sm text-stone-500 mt-1">
                <span className="font-semibold text-green-700">+91 {phone}</span> पर भेजा गया
              </p>
            </div>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="• • • • • •"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
              className="text-center text-3xl tracking-[0.5em] font-bold h-16 rounded-xl border-stone-200 focus:border-green-500"
              autoFocus
            />
            <Button
              className="w-full h-12 text-base font-semibold rounded-xl shadow-sm"
              onClick={verifyOtp}
              disabled={loading}
            >
              {loading ? "सत्यापित हो रहा है..." : "सत्यापित करें ✓"}
            </Button>
            <button
              className="w-full text-sm text-stone-400 hover:text-green-700 transition-colors"
              onClick={() => { setStep("phone"); setOtp(""); }}
            >
              ← नंबर बदलें
            </button>
          </div>
        )}

        {/* Name step */}
        {step === "name" && (
          <div className="max-w-sm mx-auto space-y-5">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">OTP सत्यापित हो गया!</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">आपका नाम?</h2>
              <p className="text-sm text-stone-500 mt-1">यह आपके Digital ID कार्ड पर दिखेगा</p>
            </div>
            <Input
              placeholder="जैसे: Rahul Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              className="h-12 rounded-xl text-base border-stone-200 focus:border-green-500"
              autoFocus
            />
            <Button
              className="w-full h-12 text-base font-semibold rounded-xl shadow-sm"
              onClick={saveName}
              disabled={loading}
            >
              {loading ? "..." : "जारी रखें →"}
            </Button>
          </div>
        )}

        {/* Student details step */}
        {step === "student_details" && (
          <div className="max-w-sm mx-auto space-y-5">
            <div>
              <h2 className="text-xl font-bold text-stone-800">अपनी जानकारी भरें</h2>
              <p className="text-sm text-stone-500 mt-1">आपके Digital ID कार्ड पर दिखेगी</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1.5 uppercase tracking-wide">
                  शिक्षा का स्तर *
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm focus:border-green-500 focus:outline-none"
                >
                  <option value="">चुनें...</option>
                  {EDUCATION_LEVELS.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1.5 uppercase tracking-wide">
                  कौन सी परीक्षा की तैयारी?
                </label>
                <select
                  value={examTarget}
                  onChange={(e) => setExamTarget(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm focus:border-green-500 focus:outline-none"
                >
                  <option value="">चुनें...</option>
                  {EXAMS.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1.5 uppercase tracking-wide">
                  स्कूल / कॉलेज का नाम
                </label>
                <Input
                  placeholder="जैसे: जगनपुर इंटर कॉलेज"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="h-12 rounded-xl border-stone-200 focus:border-green-500"
                />
              </div>
            </div>

            <Button
              className="w-full h-12 text-base font-semibold rounded-xl shadow-sm"
              onClick={() => saveStudentDetails(false)}
              disabled={loading}
            >
              {loading ? "सहेजा जा रहा है..." : "जानकारी सहेजें →"}
            </Button>
            <button
              className="w-full text-xs text-stone-400 hover:text-stone-500 transition-colors"
              onClick={() => saveStudentDetails(true)}
            >
              अभी छोड़ें, बाद में भरें
            </button>
          </div>
        )}

        {/* Success step */}
        {step === "success" && (
          <div className="max-w-sm mx-auto text-center space-y-6 py-6">
            <div className="text-7xl">🎉</div>

            <div>
              <h2 className="text-2xl font-black text-green-800">
                {isNewUser ? "Registration सफल!" : "वापस आए!"}
              </h2>
              {userData?.name && (
                <p className="text-stone-600 mt-1">
                  नमस्ते, <span className="font-semibold">{userData.name}</span>
                </p>
              )}
            </div>

            {digitalId && (
              <div className="bg-white rounded-3xl shadow-lg border border-green-100 p-6 mx-4">
                <p className="text-xs text-stone-400 font-semibold uppercase tracking-widest mb-2">
                  आपकी Digital ID
                </p>
                <p className="text-4xl font-black text-green-700 tracking-wider">{digitalId}</p>
                <p className="text-xs text-stone-400 mt-2">इसे याद रखें 📌</p>
              </div>
            )}

            {educationLevel && (
              <div className="bg-white rounded-2xl border border-stone-100 p-4 text-sm text-left space-y-2 mx-2">
                <p className="font-semibold text-stone-700 text-xs uppercase tracking-wide mb-2">आपकी जानकारी</p>
                {educationLevel && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎓</span>
                    <span className="text-stone-700">{EDUCATION_LEVELS.find(e => e.value === educationLevel)?.label}</span>
                  </div>
                )}
                {examTarget && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">📚</span>
                    <span className="text-stone-700">{EXAMS.find(e => e.value === examTarget)?.label}</span>
                  </div>
                )}
                {schoolName && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏫</span>
                    <span className="text-stone-700">{schoolName}</span>
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full h-12 text-base font-semibold rounded-xl shadow-sm"
              onClick={goHome}
            >
              पोर्टल खोलें →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
