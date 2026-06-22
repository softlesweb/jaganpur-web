"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-stone-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {step !== "success" && (
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎓</div>
            <h1 className="text-2xl font-bold text-green-800">जगनपुर छात्र पोर्टल</h1>
            <p className="text-stone-500 text-sm mt-2 leading-relaxed">
              अपना WhatsApp नंबर डालें और Register करें<br />
              <span className="text-green-700 font-medium">यह बिल्कुल मुफ़्त है</span>
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-4">

          {/* Step 1: Phone */}
          {step === "phone" && (
            <>
              <label className="text-sm font-medium text-stone-700 block">
                अपना WhatsApp नंबर दर्ज करें
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-stone-100 rounded-lg text-stone-600 text-sm border border-stone-200">
                  +91
                </span>
                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                  autoFocus
                />
              </div>
              <Button className="w-full bg-green-700 hover:bg-green-800" onClick={sendOtp} disabled={loading}>
                {loading ? "भेजा जा रहा है..." : "WhatsApp OTP भेजें"}
              </Button>
            </>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <>
              <p className="text-sm text-stone-600 text-center">
                +91 {phone} पर OTP भेजा गया
              </p>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6 अंकों का OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
                className="text-center text-2xl tracking-widest font-mono"
                autoFocus
              />
              <Button className="w-full bg-green-700 hover:bg-green-800" onClick={verifyOtp} disabled={loading}>
                {loading ? "सत्यापित हो रहा है..." : "सत्यापित करें"}
              </Button>
              <button className="w-full text-sm text-stone-400 hover:text-stone-600"
                onClick={() => { setStep("phone"); setOtp(""); }}>
                नंबर बदलें
              </button>
            </>
          )}

          {/* Step 3: Name */}
          {step === "name" && (
            <>
              <p className="text-sm text-green-700 font-medium text-center">✓ OTP सत्यापित हो गया!</p>
              <label className="text-sm font-medium text-stone-700 block">आपका नाम</label>
              <Input
                placeholder="अपना पूरा नाम दर्ज करें"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                autoFocus
              />
              <Button className="w-full bg-green-700 hover:bg-green-800" onClick={saveName} disabled={loading}>
                {loading ? "..." : "जारी रखें →"}
              </Button>
            </>
          )}

          {/* Step 4: Student Details */}
          {step === "student_details" && (
            <>
              <div className="text-center">
                <p className="font-semibold text-stone-800">अपनी जानकारी भरें</p>
                <p className="text-xs text-stone-400 mt-0.5">यह आपके Digital ID कार्ड पर दिखेगी</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">शिक्षा का स्तर *</label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                  >
                    <option value="">चुनें...</option>
                    {EDUCATION_LEVELS.map((e) => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">कौन सी परीक्षा की तैयारी?</label>
                  <select
                    value={examTarget}
                    onChange={(e) => setExamTarget(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                  >
                    <option value="">चुनें...</option>
                    {EXAMS.map((e) => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">स्कूल / कॉलेज का नाम</label>
                  <Input
                    placeholder="जैसे: जगनपुर इंटर कॉलेज"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                  />
                </div>
              </div>

              <Button className="w-full bg-green-700 hover:bg-green-800" onClick={() => saveStudentDetails(false)} disabled={loading}>
                {loading ? "सहेजा जा रहा है..." : "जानकारी सहेजें →"}
              </Button>
              <button className="w-full text-xs text-stone-400 hover:text-stone-500"
                onClick={() => saveStudentDetails(true)}>
                अभी छोड़ें, बाद में भरें
              </button>
            </>
          )}

          {/* Step 5: Success */}
          {step === "success" && (
            <div className="text-center space-y-5 py-2">
              <div className="text-5xl">🎉</div>
              <div>
                <h2 className="text-xl font-bold text-green-800">
                  {isNewUser ? "Registration सफल!" : "वापस आए! स्वागत है"}
                </h2>
                <p className="text-stone-500 text-sm mt-1">
                  {userData?.name ? `नमस्ते, ${userData.name}` : ""}
                </p>
              </div>

              {digitalId && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
                  <p className="text-xs text-stone-500 mb-1">आपकी Digital ID</p>
                  <p className="text-3xl font-black text-green-700 tracking-wider">{digitalId}</p>
                  <p className="text-xs text-stone-400 mt-1">इसे याद रखें</p>
                </div>
              )}

              {educationLevel && (
                <div className="bg-stone-50 rounded-xl p-3 text-sm text-left space-y-1">
                  {educationLevel && <p><span className="text-stone-400">शिक्षा: </span><span className="font-medium">{EDUCATION_LEVELS.find(e => e.value === educationLevel)?.label}</span></p>}
                  {examTarget && <p><span className="text-stone-400">परीक्षा: </span><span className="font-medium">{EXAMS.find(e => e.value === examTarget)?.label}</span></p>}
                  {schoolName && <p><span className="text-stone-400">संस्था: </span><span className="font-medium">{schoolName}</span></p>}
                </div>
              )}

              <Button className="w-full bg-green-700 hover:bg-green-800" onClick={goHome}>
                पोर्टल खोलें →
              </Button>
            </div>
          )}
        </div>

        {step === "phone" && (
          <p className="text-center text-xs text-stone-400 mt-4">
            Registration निःशुल्क है • WhatsApp जरूरी है
          </p>
        )}
      </div>
    </div>
  );
}
